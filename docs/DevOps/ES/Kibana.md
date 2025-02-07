## secret.yml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kibana-auth
  namespace: kube-logging
type: kubernetes.io/basic-auth
stringData: # stringData可以不用base64
  username: kibana
  password: "123456"
```
- kibana账号用于连接es，需要在es内修改密码
## config.yml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kibana-config
  namespace: kube-logging
data:
  kibana.yml: |
    server.name: kibana
    server.host: "0.0.0.0"
    server.ssl.enabled: true
    server.ssl.certificate: /usr/share/kibana/config/certs/tls.crt
    server.ssl.key: /usr/share/kibana/config/certs/tls.key
    elasticsearch.hosts: ["https://elasticsearch-master.kube-logging.svc.cluster.local:9200"]
    elasticsearch.ssl.certificateAuthorities: /usr/share/kibana/config/certs/ca.crt
```
- server.host 指定哪些对象可以连接kibana，可以结合使用防火墙或反向代理来限制访问
## service.yml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: kibana
  namespace: kube-logging
spec:
  ports:
  - port: 5601
    targetPort: 5601
  selector:
    app: kibana
  type: NodePort
```
## deploy.yml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
  namespace: kube-logging
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
      - name: kibana
        image: docker.elastic.co/kibana/kibana:8.16.1
        env:
        - name: ELASTICSEARCH_USERNAME
          valueFrom:
            secretKeyRef:
              key: username
              name: kibana-auth
        - name: ELASTICSEARCH_PASSWORD
          valueFrom:
            secretKeyRef:
              key: password
              name: kibana-auth
        ports:
        - containerPort: 5601
        volumeMounts:
        - name: config-volume
          mountPath: /usr/share/kibana/config/kibana.yml
          subPath: kibana.yml
        - name: certs-volume
          mountPath: /usr/share/kibana/config/certs
      volumes:
      - name: config-volume
        configMap:
          name: kibana-config
      - name: certs-volume
        secret:
          secretName: elasticsearch-master-certs
```