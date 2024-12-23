## configMap.yml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitor
data:
  prometheus.yml: |
    global:
          scrape_interval: 15s
          external_labels:
            monitor: 'codelab-monitor'
    scrape_configs:
      - job_name: 'kubernetes-nodes'  # 监控 Kubernetes 节点
        kubernetes_sd_configs:
          - role: node  # 发现节点
        relabel_configs:
          - source_labels: [__meta_kubernetes_node_name]
            action: replace
            target_label: instance
            replacement: $1
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)
          - action: drop
            regex: __meta_kubernetes_node_label_kubernetes_io_hostname  # 可选，丢弃主机名标签
          - source_labels: [__address__] #配置的原始标签，匹配地址   
            regex: '(.*):10250'   #匹配带有10250端口的url
            replacement: '${1}:9100'  #把匹配到的ip:10250的ip保留
            target_label: __address__ #新生成的url是${1}获取到的ip:9100
            action: replace
      - job_name: 'kubernetes-node-cadvisor'
        kubernetes_sd_configs:
          - role:  node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - action: labelmap  #把匹配到的标签保留
            regex: __meta_kubernetes_node_label_(.+) #保留匹配到的具有__meta_kubernetes_node_label的标签
          - target_label: __address__  #获取到的地址 __address__="192.168.40.180:10250"
            replacement: kubernetes.default.svc:443 
          - source_labels: [__meta_kubernetes_node_name]
            regex: (.+)
            target_label: __metrics_path__
            replacement: /api/v1/nodes/${1}/proxy/metrics/cadvisor
      - job_name: 'kube-state-metrics'
        kubernetes_sd_configs:
          - role: endpoints
        relabel_configs:
          - source_labels: [__meta_kubernetes_service_name]
            action: keep
            regex: kube-state-metrics
    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - 10.103.126.161:9093  # 确保此处的地址与您的 Alertmanager 服务相匹配
    rule_files:
      - /etc/prometheus/config/rules.yml
```
## pvc.yml
按需手动指定pv或通过storageClass和provisioner自动分配
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: prometheus-pvc
  namespace: monitor
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 512Mi
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: prometheus-pv
spec:
  capacity:
    storage: 512Mi  # 根据需求设置存储大小
  accessModes:
    - ReadWriteOnce
  hostPath:  # 示例使用 hostPath（在生产环境中，建议使用网络存储）
    path: /Users/chenyijie23/server/prometheus/data  # 存储路径
```
## deployment.yml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitor
  labels:
    app: prometheus
spec:
  strategy:
    type: Recreate
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - image: prom/prometheus:v3.0.0
        name: prometheus
        command:
        - "/bin/prometheus"
        args:
        - "--config.file=/etc/prometheus/config/prometheus.yml"
        - "--storage.tsdb.path=/data"
        - "--web.enable-lifecycle"
        securityContext:
          runAsUser: 0
        ports:
        - containerPort: 9090
          protocol: TCP
        resources:
          limits:
            memory: "256Mi"
            cpu: "500m"
        volumeMounts:
        - mountPath: "/etc/prometheus/config/"
          name: config
        - name: host-time
          mountPath: /etc/localtime
        - name: data
          mountPath: /data
      serviceAccountName: monitor-sa
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: host-time
        hostPath:
          path: /etc/localtime
      - name: data
        persistentVolumeClaim:
          claimName: prometheus-pvc
```
## service.yml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: monitor
  labels:
    app: prometheus
spec:
  ports:
    - name: "web"
      port: 9090
      protocol: TCP
      targetPort: 9090
  selector:
    app: prometheus
```
## rbac.yml 
此处偷懒使用了cluster-admin
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: monitor-sa
  namespace: monitor
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus-binding
subjects:
- kind: ServiceAccount
  name: monitor-sa
  namespace: monitor
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```