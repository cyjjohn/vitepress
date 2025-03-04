# SkyWalking 监控 K8s
## 部署KSM和cAdvisor收集指标
> 收集 Kubernetes 资源的指标，例如 CPU、服务、Pod 和节点
使用官方例子中的资源清单

[官方GitHub](https://github.com/kubernetes/kube-state-metrics/blob/main/examples/standard)
## OpenTelemetry Collector 抓取并推送
> OpenTelemetry Collector 通过 Prometheus Receiver 从 kube-state-metrics 和 cAdvisor 获取指标，并通过 OpenTelemetry gRPC exporter 将指标推送到 SkyWalking OAP Server

### configMap.yml
```yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-config
  namespace: middleware
data:
  otel-collector-config.yaml: |
    #  将上面的 otel-collector-config.yaml 内容粘贴到这里
    receivers:
      prometheus:
        config:
          scrape_configs:
            # kube-state-metrics 监控node
            - job_name: 'kube-state-metrics'
              scrape_interval: 15s
              static_configs:
                - targets: ['kube-state-metrics.kube-system.svc.cluster.local:8080']
              relabel_configs:
                - action: labelmap
                  regex: __meta_kubernetes_node_label_(.+)
                  replacement: '$\$1'  # 建议使用单引号
                - source_labels: [ ]
                  target_label: cluster
                  replacement: k8s-cluster  ##  skywalking仪表盘集群显示的名称,需要修改
            # cadvisor 监控节点上资源
            - job_name: 'cadvisor'
              scrape_interval: 15s
              kubernetes_sd_configs:
                - role: node # 使用 node role 来发现节点
              tls_config:
                insecure_skip_verify: false
                ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
              authorization:
                credentials_file: /var/run/secrets/kubernetes.io/serviceaccount/token

    processors:
      batch:

    exporters:
      otlp:
        endpoint: "skywalking-oap.middleware.svc.cluster.local:11800"
        tls:
          insecure: true

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          processors: [batch]
          exporters: [otlp]
```
### rbac.yml
OTel Collector 监控Kubernetes集群中的Node资源需要额外权限
```yml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-sa
  namespace: middleware
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-reader
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["nodes/metrics", "nodes/proxy"] # 访问 kubelet 的 /metrics/cadvisor 和 /proxy 端点
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]  # 访问 Pod 信息 (用于 SkyWalking OAP 自监控)
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "list", "watch"] # 访问 Service 信息 (用于 SkyWalking OAP 自监控)
- apiGroups: [""]
  resources: ["endpoints"]
  verbs: ["get", "list", "watch"] # 访问 Endpoint 信息(用于 SkyWalking OAP 自监控)
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-reader-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-reader
subjects:
- kind: ServiceAccount
  name: otel-collector-sa  # 使用新的 ServiceAccount 名称
  namespace: middleware
```
### deploy.yml
```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector
  namespace: middleware
spec:
  selector:
    matchLabels:
      app: otel-collector
  replicas: 1
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      serviceAccountName: otel-collector-sa  # 指定 ServiceAccount
      containers:
        - name: otel-collector
          image: otel/opentelemetry-collector-contrib:0.120.0  # 使用最新的 contrib 版本
          command: ["/otelcol-contrib"]
          args: ["--config=/conf/otel-collector-config.yaml"]
          volumeMounts:
            - name: otel-collector-config
              mountPath: /conf/
      volumes:
        - name: otel-collector-config
          configMap:
            name: otel-collector-config
```