# 资源清单
## kustomization
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# 声明资源
resources:
  - es-statefulSet.yml
  - es-svc.yml
  - es-svc-headless.yml
  - es-secret.yml
```

## statefulSet.yml
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app: elasticsearch-master
    chart: elasticsearch
    release: elasticsearch
  name: elasticsearch-master
  namespace: kube-logging
spec:
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: Retain
    whenScaled: Retain
  podManagementPolicy: Parallel
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch-master
  serviceName: elasticsearch-master-headless
  template:
    metadata:
      labels:
        app: elasticsearch-master
        chart: elasticsearch
        release: elasticsearch
      name: elasticsearch-master
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - elasticsearch-master
            topologyKey: kubernetes.io/hostname
      automountServiceAccountToken: true
      containers:
      - env:
        - name: node.name
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.name
        - name: cluster.initial_master_nodes
          value: elasticsearch-master-0,elasticsearch-master-1,elasticsearch-master-2,
        - name: node.roles
          value: master,data,data_content,data_hot,data_warm,data_cold,ingest,ml,remote_cluster_client,transform,
        - name: discovery.seed_hosts
          value: "elasticsearch-master-0.elasticsearch-master-headless.kube-logging.svc.cluster.local:9300,elasticsearch-master-1.elasticsearch-master-headless.kube-logging.svc.cluster.local:9300,elasticsearch-master-2.elasticsearch-master-headless.kube-logging.svc.cluster.local:9300"
        - name: cluster.name
          value: elasticsearch
        - name: network.host
          value: 0.0.0.0
        - name: ELASTIC_PASSWORD
          valueFrom:
            secretKeyRef:
              key: password
              name: elasticsearch-master-credentials
        - name: xpack.security.enabled
          value: "true"
        - name: xpack.security.transport.ssl.enabled
          value: "true"
        - name: xpack.security.enrollment.enabled
          value: "true"
        - name: xpack.security.http.ssl.enabled
          value: "true"
        - name: xpack.security.transport.ssl.verification_mode
          value: certificate
        - name: xpack.security.transport.ssl.key
          value: /usr/share/elasticsearch/config/certs/tls.key
        - name: xpack.security.transport.ssl.certificate
          value: /usr/share/elasticsearch/config/certs/tls.crt
        - name: xpack.security.transport.ssl.certificate_authorities
          value: /usr/share/elasticsearch/config/certs/ca.crt
        - name: xpack.security.http.ssl.key
          value: /usr/share/elasticsearch/config/certs/tls.key
        - name: xpack.security.http.ssl.certificate
          value: /usr/share/elasticsearch/config/certs/tls.crt
        - name: xpack.security.http.ssl.certificate_authorities
          value: /usr/share/elasticsearch/config/certs/ca.crt
        image: docker.elastic.co/elasticsearch/elasticsearch:8.16.1
        imagePullPolicy: IfNotPresent
        name: elasticsearch
        ports:
        - containerPort: 9200
          name: http
          protocol: TCP
        - containerPort: 9300
          name: transport
          protocol: TCP
        readinessProbe:
          exec:
            command:
            - bash
            - -c
            - |
              set -e

              # Exit if ELASTIC_PASSWORD in unset
              if [ -z "${ELASTIC_PASSWORD}" ]; then
                echo "ELASTIC_PASSWORD variable is missing, exiting"
                exit 1
              fi

              # If the node is starting up wait for the cluster to be ready (request params: "wait_for_status=green&timeout=1s" )
              # Once it has started only check that the node itself is responding
              START_FILE=/tmp/.es_start_file

              # Disable nss cache to avoid filling dentry cache when calling curl
              # This is required with Elasticsearch Docker using nss < 3.52
              export NSS_SDB_USE_CACHE=no

              http () {
                local path="${1}"
                local args="${2}"
                set -- -XGET -s

                if [ "$args" != "" ]; then
                  set -- "$@" $args
                fi

                set -- "$@" -u "elastic:${ELASTIC_PASSWORD}"

                curl --output /dev/null -k "$@" "https://127.0.0.1:9200${path}"
              }

              if [ -f "${START_FILE}" ]; then
                echo 'Elasticsearch is already running, lets check the node is healthy'
                HTTP_CODE=$(http "/" "-w %{http_code}")
                RC=$?
                if [[ ${RC} -ne 0 ]]; then
                  echo "curl --output /dev/null -k -XGET -s -w '%{http_code}' \${ELASTIC_PASSWORD} https://127.0.0.1:9200/ failed with RC ${RC}"
                  exit ${RC}
                fi
                # ready if HTTP code 200, 503 is tolerable if ES version is 6.x
                if [[ ${HTTP_CODE} == "200" ]]; then
                  exit 0
                elif [[ ${HTTP_CODE} == "503" && "8" == "6" ]]; then
                  exit 0
                else
                  echo "curl --output /dev/null -k -XGET -s -w '%{http_code}' \${ELASTIC_PASSWORD} https://127.0.0.1:9200/ failed with HTTP code ${HTTP_CODE}"
                  exit 1
                fi

              else
                echo 'Waiting for elasticsearch cluster to become ready (request params: "wait_for_status=green&timeout=1s" )'
                if http "/_cluster/health?wait_for_status=green&timeout=1s" "--fail" ; then
                  touch ${START_FILE}
                  exit 0
                else
                  echo 'Cluster is not yet ready (request params: "wait_for_status=green&timeout=1s" )'
                  exit 1
                fi
              fi
          failureThreshold: 3
          initialDelaySeconds: 10
          periodSeconds: 10
          successThreshold: 3
          timeoutSeconds: 5
        resources:
          limits:
            cpu: "1"
            memory: 2Gi
          requests:
            cpu: "1"
            memory: 2Gi
        securityContext:
          capabilities:
            drop:
            - ALL
          runAsNonRoot: true
          runAsUser: 1000
        volumeMounts:
        - mountPath: /usr/share/elasticsearch/data
          name: elasticsearch-master
        - mountPath: /usr/share/elasticsearch/config/certs
          name: elasticsearch-certs
          readOnly: true
      initContainers:
      - command:
        - sysctl
        - -w
        - vm.max_map_count=262144
        image: docker.elastic.co/elasticsearch/elasticsearch:8.16.1
        imagePullPolicy: IfNotPresent
        name: configure-sysctl
        resources: {}
        securityContext:
          privileged: true
          runAsUser: 0
        terminationMessagePolicy: File
      restartPolicy: Always
      schedulerName: default-scheduler
      securityContext:
        fsGroup: 1000
        runAsUser: 1000
      terminationGracePeriodSeconds: 120
      volumes:
      - name: elasticsearch-certs
        secret:
          defaultMode: 420
          secretName: elasticsearch-master-certs
  updateStrategy:
    type: RollingUpdate
  volumeClaimTemplates:
  - apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: elasticsearch-master
    spec:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi
      volumeMode: Filesystem
```
## es-svc.yml
```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: elasticsearch-master
    chart: elasticsearch
    release: elasticsearch
  name: elasticsearch-master
  namespace: kube-logging
spec:
  internalTrafficPolicy: Cluster
  ipFamilies:
  - IPv4
  ipFamilyPolicy: SingleStack
  ports:
  - name: http
    port: 9200
    protocol: TCP
    targetPort: 9200
  - name: transport
    port: 9300
    protocol: TCP
    targetPort: 9300
  selector:
    app: elasticsearch-master
    chart: elasticsearch
    release: elasticsearch
  sessionAffinity: None
  type: ClusterIP
status:
  loadBalancer: {}
```
## es-svc-headless.yml
```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: elasticsearch-master
    chart: elasticsearch
    release: elasticsearch
  name: elasticsearch-master-headless
  namespace: kube-logging
spec:
  clusterIP: None
  clusterIPs:
  - None
  internalTrafficPolicy: Cluster
  ports:
  - name: http
    port: 9200
    protocol: TCP
    targetPort: 9200
  - name: transport
    port: 9300
    protocol: TCP
    targetPort: 9300
  publishNotReadyAddresses: true
  selector:
    app: elasticsearch-master
  sessionAffinity: None
  type: ClusterIP
```
## 创建带有Subject Alternative Name (SAN)的自签名证书
生成 CA 签名证书通常需要使用 OpenSSL 或类似的工具。  以下步骤概述了如何使用 OpenSSL 生成 CA 证书以及如何使用 CA 证书签署其他证书。
1. 创建 CA 私钥和自签名证书:
``openssl req -x509 -newkey rsa:4096 -keyout ca.key -out ca.crt -days 3650 -nodes -subj "/CN=elasticsearch/O=CMB/OU=My Unit/L=Shanghai/ST=My State/C=CN"``
- -x509: 生成自签名证书。
- -newkey rsa:4096: 生成一个 4096 位的 RSA 私钥。
- -keyout ca.key: 将私钥保存到 ca.key 文件。
- -out ca.crt: 将证书保存到 ca.crt 文件。
- -days 3650: 证书有效期为 10 年。
- -nodes: 不加密私钥。 注意：在生产环境中，强烈建议加密私钥。
- -subj: 指定证书主题信息。 请替换为你的实际信息。

2. 创建服务器证书签名请求 (CSR):
``openssl req -newkey rsa:4096 -keyout server.key -out server.csr -nodes -subj "/C=CN/ST=My State/L=Shanghai/O=CMB/OU=My Unit/CN=elasticsearch" -addext "subjectAltName = DNS:elasticsearch-master.kube-logging.svc.cluster.local,DNS:elasticsearch-master-0.elasticsearch-master-headless.kube-logging.svc.cluster.local,DNS:elasticsearch-master-1.elasticsearch-master-headless.kube-logging.svc.cluster.local,DNS:elasticsearch-master-2.elasticsearch-master-headless.kube-logging.¡svc.cluster.local"``
- -newkey rsa:4096: 生成一个 4096 位的 RSA 私钥。
- -keyout server.key: 将私钥保存到 server.key 文件。
- -out server.csr: 将 CSR 保存到 server.csr 文件。
- -nodes: 不加密私钥。 注意：在生产环境中，强烈建议加密私钥。
- -subj: 指定证书主题信息。 请替换为你的实际信息。
- -addext "subjectAltName = DNS:yourserver.example.com": 非常重要! 添加主题备用名称 (SAN)，将 yourserver.example.com 替换为你的服务器域名或 IP 地址。 这可以防止出现证书不匹配的错误。 你可以添加多个 SAN，例如：subjectAltName = DNS:yourserver.example.com,DNS:yourserver

3. 使用 CA 证书签署服务器 CSR:
``openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 3650 -sha256 -extfile < (echo "subjectAltName = DNS:elasticsearch-master.kube-logging.svc.cluster.local,DNS:elasticsearch-master-0.elasticsearch-master-headless.kube-logging.svc.cluster.local,DNS:elasticsearch-master-1.elasticsearch-master-headless.kube-logging.svc.cluster.local,DNS:elasticsearch-master-2.elasticsearch-master-headless.kube-logging.svc.cluster.local")``


## CSR中subjectAltName的DNS
如果使用k8s的service有几种方案:
1. 使用 Kubernetes Service DNS 名称：  这是推荐的方法。为你的 Elasticsearch 集群创建一个 Kubernetes Service，然后在证书的 SAN 中使用 Service 的 DNS 名称。  Service 的 DNS 名称会解析到后端 Pod 的 IP 地址，即使 Pod 重建，DNS 名称也保持不变。

2. 确保你的 Elasticsearch 配置使用 Service DNS 名称进行节点之间的通信和客户端连接。 例如，在 elasticsearch.yml 中，使用 discovery.seed_hosts: ["&lt;elasticsearch-service-name&gt;.&lt;namespace&gt;.svc.cluster.local:9300"]。
在生成证书时，将 &lt;elasticsearch-service-name&gt;.&lt;namespace&gt;.svc.cluster.local 添加到 SAN。
使用 StatefulSet 和 Headless Service：  如果你使用 StatefulSet 来管理 Elasticsearch 集群，可以创建一个 Headless Service。 Headless Service 会为每个 Pod 分配一个稳定的 DNS 名称，例如 &lt;pod-name&gt;.&lt;headless-service-name&gt;.&lt;namespace&gt;.svc.cluster.local。  你可以在证书的 SAN 中包含这些稳定的 DNS 名称。

## 创建secrets
存放cert
```bash
kubectl -n kube-logging create secret generic elasticsearch-master-certs --from-file=tls.key=/tmp/server.key --from-file=tls.crt=/tmp/server.crt --from-file=ca.crt=/tmp/ca.crt
```
存放用户密码
```bash
kubectl -n kube-logging create secret generic elasticsearch-master-credentials --from-literal=username=elastic --from-literal=password=123456
```

## 验证
1. 查看集群中的Pod是否启动
```bash
kubectl get pods --namespace=kube-logging -l app=elasticsearch-master -w
```
2. 查看elastic用户初始密码
```bash
kubectl get secrets --namespace=kube-logging elasticsearch-master-credentials -ojsonpath='{.data.password}' | base64 -d
```
3. 查看状态
```bash
kubectl -n kube-logging port-forward elasticsearch-master-0 9200:9200
curl -X GET "https://localhost:9200/_cluster/health?pretty" -u "username:password" --cacert /path/to/ca.crt
```

## 创建/修改密码
[8.16版本官网指南](https://elastic.ac.cn/guide/en/elasticsearch/reference/8.16/reset-password.html)

修改kibana用户的密码
```bash
bin/elasticsearch-reset-password -u kibana --url "https://elasticsearch-master-0.elasticsearch-master-headless.kube-logging.svc.cluster.local:9200" -i
```
