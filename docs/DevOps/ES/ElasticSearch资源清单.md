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
  revisionHistoryLimit: 10
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
          value: elasticsearch-master-headless
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
                  echo "curl --output /dev/null -k -XGET -s -w '%{http_code}' \${BASIC_AUTH} https://127.0.0.1:9200/ failed with RC ${RC}"
                  exit ${RC}
                fi
                # ready if HTTP code 200, 503 is tolerable if ES version is 6.x
                if [[ ${HTTP_CODE} == "200" ]]; then
                  exit 0
                elif [[ ${HTTP_CODE} == "503" && "8" == "6" ]]; then
                  exit 0
                else
                  echo "curl --output /dev/null -k -XGET -s -w '%{http_code}' \${BASIC_AUTH} https://127.0.0.1:9200/ failed with HTTP code ${HTTP_CODE}"
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
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
        volumeMounts:
        - mountPath: /usr/share/elasticsearch/data
          name: elasticsearch-master
        - mountPath: /usr/share/elasticsearch/config/certs
          name: elasticsearch-certs
          readOnly: true
      dnsPolicy: ClusterFirst
      enableServiceLinks: true
      initContainers:
      - command:
        - sysctl
        - -w
        - vm.max_map_count=262144
        image: docker.elastic.co/elasticsearch/elasticsearch:8.5.1
        imagePullPolicy: IfNotPresent
        name: configure-sysctl
        resources: {}
        securityContext:
          privileged: true
          runAsUser: 0
        terminationMessagePath: /dev/termination-log
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
          storage: 30Gi
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
  publishNotReadyAddresses: true
  selector:
    app: elasticsearch-master
  sessionAffinity: None
  type: ClusterIP
```
## es-secret.yml
先生成tls.key和tls.crt并base64编码
```bash
# 生成ca.key ca.crt
openssl genrsa -out ca.key 2048
openssl req -new -x509 -days 365 -key ca.key -out ca.crt
# 生成tlk.key tlk.crt
openssl genrsa -out tls.key 2048
openssl req -new -key tls.key -out tls.csr
openssl x509 -req -in tls.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out tls.crt -days 365
# secret资源中需要bas64编码
base64 ca.crt
base64 tls.crt
base64 tls.key
```
```yaml
apiVersion: v1
data:
  ca.crt: 已省略...
  tls.crt: 已省略...
  tls.key: 已省略...
kind: Secret
metadata:
  annotations:
    meta.helm.sh/release-name: elasticsearch
    meta.helm.sh/release-namespace: kube-logging
  labels:
    app: elasticsearch-master
    chart: elasticsearch
  name: elasticsearch-master-certs
  namespace: kube-logging
type: kubernetes.io/tls
---
apiVersion: v1
data:
  password: RlRFM3FaYmJEcmJDM1ZHUA==
  username: ZWxhc3RpYw==
kind: Secret
metadata:
  annotations:
    meta.helm.sh/release-name: elasticsearch
    meta.helm.sh/release-namespace: kube-logging
  labels:
    app: elasticsearch-master
    chart: elasticsearch
    release: elasticsearch
  name: elasticsearch-master-credentials
  namespace: kube-logging
type: Opaque
```

## 验证
1. 查看集群中的Pod是否启动
  kubectl get pods --namespace=kube-logging -l app=elasticsearch-master -w
2. 查看elastic用户初始密码
  kubectl get secrets --namespace=kube-logging elasticsearch-master-credentials -ojsonpath='{.data.password}' | base64 -d
3. 查看状态
  kubectl -n kube-logging port-forward elasticsearch-master-0 9200:9200 
  curl -X GET "https://localhost:9200/_cluster/health?pretty" -u "username:password" --cacert /path/to/ca.crt
