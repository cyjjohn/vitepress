# 资源清单
## namesrv
### statefulSet.yml
```yml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app: rocketmq-namesrv
    version: v1
  name: rocketmq-namesrv-v1
  namespace: middleware
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rocketmq-namesrv
      version: v1
  serviceName: rocketmq-namesrv
  template:
    metadata:
      labels:
        app: rocketmq-namesrv
        version: v1
    spec:
      containers:
      - args:
        - mqnamesrv
        command:
        - /bin/bash
        env:
        - name: JAVA_OPT_EXT
          value: -Xms512M -Xmx512M -Xmn128m
        image: apache/rocketmq:5.3.1
        imagePullPolicy: IfNotPresent
        name: rocketmq-namesrv
        ports:
        - containerPort: 9876
          name: tcp-9876
          protocol: TCP
        resources:
          limits:
            cpu: "1"
            memory: 2Gi
          requests:
            cpu: 200m
            memory: 512Mi
        volumeMounts:
        - mountPath: /home/rocketmq/logs
          name: logs
      volumes:
      - name: logs
        persistentVolumeClaim:
          claimName: rocketmq-namesrv-pvc
  updateStrategy:
    type: RollingUpdate
```
### pvc.yml
```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rocketmq-namesrv-pvc
  namespace: middleware
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: nfs-client
  volumeMode: Filesystem
```
### service.yml
```yml
apiVersion: v1
kind: Service
metadata:
  name: rocketmq-namesrv
  namespace: middleware
  labels:
    app: rocketmq-namesrv
spec:
  ports:
  - name: http-9876
    port: 9876
    protocol: TCP
    targetPort: 9876
  selector:
    app: rocketmq-namesrv
    version: v1
  type: LoadBalancer
```

## broker
### statefulSet.yml
```yml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app: rocketmq-broker
    version: v1
  name: rocketmq-broker-v1
  namespace: middleware
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rocketmq-broker
      version: v1
  serviceName: rocketmq-broker
  template:
    metadata:
      labels:
        app: rocketmq-broker
        version: v1
    spec:
      containers:
      - args:
        - mqbroker
        - -n
        - rocketmq-namesrv.middleware.svc.cluster.local:9876
        - --enable-proxy
        command:
        - /bin/bash
        env:
        - name: JAVA_OPT_EXT
          value: -server -Xms128m -Xmx128m -Xmn128m
        - name: NAMESRV_ADDR
          value: rocketmq-namesrv.middleware.svc.cluster.local:9876
        image: apache/rocketmq:5.3.1
        imagePullPolicy: IfNotPresent
        name: rocketmq
        ports:
        - containerPort: 10912
          name: tcp-10912
          protocol: TCP
        - containerPort: 10911
          name: tcp-10911
          protocol: TCP
        - containerPort: 10909
          name: tcp-10909
          protocol: TCP
        resources:
          limits:
            cpu: "1"
            memory: 2Gi
          requests:
            cpu: 200m
            memory: 256Mi
        volumeMounts:
        - mountPath: /home/rocketmq/store
          name: store
        - mountPath: /home/rocketmq/logs
          name: logs
      volumes:
      - name: store
        persistentVolumeClaim:
          claimName: rocketmq-broker-store
      - name: logs
        persistentVolumeClaim:
          claimName: rocketmq-broker-logs
  updateStrategy:
    type: RollingUpdate
```
### pvc.yml
```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rocketmq-broker-logs
  namespace: middleware
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: nfs-client
  volumeMode: Filesystem
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rocketmq-broker-store
  namespace: middleware
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: nfs-client
  volumeMode: Filesystem
```
### service.yml
```yml
apiVersion: v1
kind: Service
metadata:
  name: rocketmq-broker
  namespace: middleware
  labels:
    app: rocketmq-broker
spec:
  ports:
  - name: tcp-10912
    port: 10912
    protocol: TCP
    targetPort: 10912
  - name: tcp-10911
    port: 10911
    protocol: TCP
    targetPort: 10911
  - name: tcp-10909
    port: 10909
    protocol: TCP
    targetPort: 10909
  - name: tcp-8080
    port: 8080
    protocol: TCP
    targetPort: 8080
  - name: tcp-8081
    port: 8081
    protocol: TCP
    targetPort: 8081
  selector:
    app: rocketmq-broker
    version: v1
  type: LoadBalancer
```