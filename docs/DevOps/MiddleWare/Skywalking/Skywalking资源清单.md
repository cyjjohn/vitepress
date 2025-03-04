# 资源清单
## skywalking-oap-server
### deploy.yml
> - [官网教程：连接开启tls的es](https://skywalking.apache.org/docs/main/next/en/setup/backend/storages/elasticsearch/#elasticsearch-with-https-ssl-encrypting-communications)
> - es的ca.crt转换成jks文件：
keytool -import -trustcacerts -keystore keystore.jks -storepass changeit -alias myca -file ca.crt
> - 已知10.1.0存在的问题：es密码使用纯数字会报错，必须使用字符串
java.lang.IllegalArgumentException: Can not set java.lang.String field org.apache.skywalking.oap.server.storage.plugin.elasticsearch.StorageModuleElasticsearchConfig.password to java.lang.Integer
```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: skywalking-oap
  namespace: middleware  # 建议创建一个单独的命名空间
spec:
  replicas: 1  # 根据需要调整副本数
  selector:
    matchLabels:
      app: skywalking-oap
  template:
    metadata:
      labels:
        app: skywalking-oap
    spec:
      containers:
      - name: skywalking-oap
        image: apache/skywalking-oap-server:10.1.0
        ports:
        - containerPort: 11800 # gRPC 端口
          name: grpc
        - containerPort: 12800 # HTTP 端口
          name: http
        env:
        - name: SW_STORAGE
          value: elasticsearch
        - name: SW_ES_USER
          value: elastic
        - name: SW_ES_PASSWORD
          value: xxxxx
        - name: SW_STORAGE_ES_CLUSTER_NODES
          value: elasticsearch-master.middleware.svc.cluster.local:9200 # 改成自己的es服务地址
        - name: SW_STORAGE_ES_HTTP_PROTOCOL
          value: https
        - name: SW_STORAGE_ES_SSL_JKS_PATH
          value: /etc/skywalking/certs/keystore.jks  # 证书文件在容器内的路径
        - name: SW_STORAGE_ES_SSL_JKS_PASS
          value: "changeit"
        # 配置OpenTelemetry Receiver
        - name: SW_OTEL_RECEIVER
          value: default
        - name: SW_OTEL_RECEIVER_ENABLED_HANDLERS
          value: "otlp-metrics"
        volumeMounts:
        - name: es-keystore
          mountPath: /etc/skywalking/certs/
          readOnly: true
      volumes:
      - name: es-keystore
        secret:
          secretName: es-keystore
```
### service.yml
```yml
apiVersion: v1
kind: Service
metadata:
  name: skywalking-oap
  namespace: middleware
spec:
  selector:
    app: skywalking-oap
  ports:
  - protocol: TCP
    port: 11800
    targetPort: grpc
    name: grpc
  - protocol: TCP
    port: 12800
    targetPort: http
    name: http
  type: ClusterIP
```
## skywalking-ui
### deploy.yml
```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: skywalking-ui
  namespace: middleware
  labels:
    app: skywalking-ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: skywalking-ui
  template:
    metadata:
      labels:
        app: skywalking-ui
    spec:
      containers:
        - name: skywalking-ui
          image: apache/skywalking-ui:10.1.0
          ports:
            - containerPort: 8080  # UI 监听的端口
          env:
            - name: SW_OAP_ADDRESS
              value: http://skywalking-oap.middleware.svc.cluster.local:12800  # 替换为你的 OAP 地址和端口
          resources:
            requests:
              cpu: 200m  # 根据需要调整
              memory: 256Mi  # 根据需要调整
            limits:
              cpu: 500m  # 根据需要调整
              memory: 512Mi  # 根据需要调整
```

### service.yml
```yml
apiVersion: v1
kind: Service
metadata:
  name: skywalking-ui
  namespace: middleware  # 替换为你的命名空间
  labels:
    app: skywalking-ui
spec:
  type: ClusterIP  # 可以根据需要更改为 NodePort 或 LoadBalancer
  selector:
    app: skywalking-ui
  ports:
    - port: 80  # Service 的端口
      targetPort: 8080  # 容器的端口 (与 Deployment 中定义的 containerPort 匹配)
      protocol: TCP
      name: http
```