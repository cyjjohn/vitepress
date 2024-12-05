# Prometheus基于kubernetes告警规则-告警等级划分（不同渠道告警）
## 一、创建告警规则
```
# prometheus-rules-conf.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  rules.yml: |
    groups:
    - name: example
      rules:
      - alert: kube-proxy的cpu使用率大于80%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-kube-proxy"}[1m]) * 100 > 80
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过80%"
      - alert:  kube-proxy的cpu使用率大于90%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-kube-proxy"}[1m]) * 100 > 90
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过90%"
      - alert: scheduler的cpu使用率大于80%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-schedule"}[1m]) * 100 > 80
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过80%"
      - alert:  scheduler的cpu使用率大于90%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-schedule"}[1m]) * 100 > 90
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过90%"
      - alert: controller-manager的cpu使用率大于80%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-controller-manager"}[1m]) * 100 > 80
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过80%"
      - alert:  controller-manager的cpu使用率大于90%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-controller-manager"}[1m]) * 100 > 90
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过90%"
      - alert: apiserver的cpu使用率大于80%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-apiserver"}[1m]) * 100 > 80
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过80%"
      - alert:  apiserver的cpu使用率大于90%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-apiserver"}[1m]) * 100 > 90
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率���过90%"
      - alert: etcd的cpu使用率大于80%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-etcd"}[1m]) * 100 > 80
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过80%"
      - alert:  etcd的cpu使用率大于90%
        expr: rate(process_cpu_seconds_total{job=~"kubernetes-etcd"}[1m]) * 100 > 90
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}组件的cpu使用率超过90%"
      - alert: kube-state-metrics的cpu使用率大于80%
        expr: rate(process_cpu_seconds_total{k8s_app=~"kube-state-metrics"}[1m]) * 100 > 80
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "{{$labels.instance}}的{{$labels.k8s_app}}组件的cpu使用率超过80%"
          value: "{{ $value }}%"
          threshold: "80%"      
      - alert: kube-state-metrics的cpu使用率大于90%
        expr: rate(process_cpu_seconds_total{k8s_app=~"kube-state-metrics"}[1m]) * 100 > 90
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "{{$labels.instance}}的{{$labels.k8s_app}}组件的cpu使用率超过90%"
          value: "{{ $value }}%"
          threshold: "90%"      
      - alert: coredns的cpu使用率大于80%
        expr: rate(process_cpu_seconds_total{k8s_app=~"kube-dns"}[1m]) * 100 > 80
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "{{$labels.instance}}的{{$labels.k8s_app}}组件的cpu使用率超过80%"
          value: "{{ $value }}%"
          threshold: "80%"      
      - alert: coredns的cpu使用率大于90%
        expr: rate(process_cpu_seconds_total{k8s_app=~"kube-dns"}[1m]) * 100 > 90
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "{{$labels.instance}}的{{$labels.k8s_app}}组件的cpu使用率超过90%"
          value: "{{ $value }}%"
          threshold: "90%"      
      - alert: kube-proxy打开句柄数>600
        expr: process_open_fds{job=~"kubernetes-kube-proxy"}  > 600
        for: 2s
        labels:
          severity: notice
          level: 1
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>600"
          value: "{{ $value }}"
      - alert: kube-proxy打开句柄数>1000
        expr: process_open_fds{job=~"kubernetes-kube-proxy"}  > 1000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>1000"
          value: "{{ $value }}"
      - alert: kubernetes-schedule打开句柄数>600
        expr: process_open_fds{job=~"kubernetes-schedule"}  > 600
        for: 2s
        labels:
          severity: notice
          level: 1
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>600"
          value: "{{ $value }}"
      - alert: kubernetes-schedule打开句柄数>1000
        expr: process_open_fds{job=~"kubernetes-schedule"}  > 1000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>1000"
          value: "{{ $value }}"
      - alert: kubernetes-controller-manager打开句柄数>600
        expr: process_open_fds{job=~"kubernetes-controller-manager"}  > 600
        for: 2s
        labels:
          severity: notice
          level: 1
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>600"
          value: "{{ $value }}"
      - alert: kubernetes-controller-manager打开句柄数>1000
        expr: process_open_fds{job=~"kubernetes-controller-manager"}  > 1000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>1000"
          value: "{{ $value }}"
      - alert: kubernetes-apiserver打开句柄数>600
        expr: process_open_fds{job=~"kubernetes-apiserver"}  > 600
        for: 2s
        labels:
          severity: notice
          level: 1
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>600"
          value: "{{ $value }}"
      - alert: kubernetes-apiserver打开句柄数>1000
        expr: process_open_fds{job=~"kubernetes-apiserver"}  > 1000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>1000"
          value: "{{ $value }}"
      - alert: kubernetes-etcd打开句柄数>600
        expr: process_open_fds{job=~"kubernetes-etcd"}  > 600
        for: 2s
        labels:
          severity: notice
          level: 1
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>600"
          value: "{{ $value }}"
      - alert: kubernetes-etcd打开句柄数>1000
        expr: process_open_fds{job=~"kubernetes-etcd"}  > 1000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "{{$labels.instance}}的{{$labels.job}}打开句柄数>1000"
          value: "{{ $value }}"
      - alert: coredns
        expr: process_open_fds{k8s_app=~"kube-dns"}  > 600
        for: 2s
        labels:
          severity: notice
          level: 1
        annotations:
          description: "插件{{$labels.k8s_app}}({{$labels.instance}}): 打开句柄数超过600"
          value: "{{ $value }}"
      - alert: coredns
        expr: process_open_fds{k8s_app=~"kube-dns"}  > 1000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "插件{{$labels.k8s_app}}({{$labels.instance}}): 打开句柄数超过1000"
          value: "{{ $value }}"
      - alert: kube-proxy
        expr: process_virtual_memory_bytes{job=~"kubernetes-kube-proxy"}  > 2000000000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): 使用虚拟内存超过2G"
          value: "{{ $value }}"
      - alert: scheduler
        expr: process_virtual_memory_bytes{job=~"kubernetes-schedule"}  > 2000000000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): 使用虚拟内存超过2G"
          value: "{{ $value }}"
      - alert: kubernetes-controller-manager
        expr: process_virtual_memory_bytes{job=~"kubernetes-controller-manager"}  > 2000000000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): 使用虚拟内存超过2G"
          value: "{{ $value }}"
      - alert: kubernetes-apiserver
        expr: process_virtual_memory_bytes{job=~"kubernetes-apiserver"}  > 2000000000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): 使用虚拟内存超过2G"
          value: "{{ $value }}"
      - alert: kubernetes-etcd
        expr: process_virtual_memory_bytes{job=~"kubernetes-etcd"}  > 2000000000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): 使用虚拟内存超过2G"
          value: "{{ $value }}"
      - alert: kube-dns
        expr: process_virtual_memory_bytes{k8s_app=~"kube-dns"}  > 2000000000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "插件{{$labels.k8s_app}}({{$labels.instance}}): 使用虚拟内存超过2G"
          value: "{{ $value }}"
      - alert: HttpRequestsAvg
        expr: sum(rate(rest_client_requests_total{job=~"kubernetes-kube-proxy|kubernetes-kubelet|kubernetes-schedule|kubernetes-control-manager|kubernetes-apiservers"}[1m]))  > 1000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): TPS超过1000"
          value: "{{ $value }}"
          threshold: "1000"   
      - alert: Pod_restarts
        expr: sum (increase (kube_pod_container_status_restarts_total{}[1m])) by (namespace,pod) >0
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "在{{$labels.namespace}}名称空间下发现{{$labels.pod}}这个pod下的容器{{$labels.container}}被重启"
          value: "{{ $value }}"
          threshold: "0"
      - alert: Pod_waiting
        expr: sum (increase (kube_pod_container_status_waiting{}[1m])) by (namespace,pod) >0
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "空间{{$labels.namespace}}({{$labels.instance}}): 发现{{$labels.pod}}下的{{$labels.container}}启动异常等待中"
          value: "{{ $value }}"
          threshold: "1"   
      - alert: Pod_terminated
        expr: sum (increase (kube_pod_container_status_terminated{}[1m])) by (namespace,pod) >0
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "空间{{$labels.namespace}}({{$labels.instance}}): 发现{{$labels.pod}}{{$labels.container}}被删除"
          value: "{{ $value }}"
          threshold: "1"
      - alert: Pod_Failed
        expr: sum (increase (kube_pod_status_phase{phase=~"Failed"}[1m])) by (namespace,pod) >0
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "空间{{$labels.namespace}}({{$labels.instance}}): 发现{{$labels.pod}}下的{{$labels.container}}启动失败"
          value: "{{ $value }}"
          threshold: "1"     
      - alert: Pod_pending
        expr: sum (increase (kube_pod_status_phase{phase=~"pending"}[1m])) by (namespace,pod) >0
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "空间{{$labels.namespace}}({{$labels.instance}}): 发现{{$labels.pod}}下的{{$labels.container}}待处理"
          value: "{{ $value }}"
          threshold: "1" 
      - alert: Pod_Unknown
        expr: sum (increase (kube_pod_status_phase{phase=~"Unknown"}[1m])) by (namespace,pod) >0
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "空间{{$labels.namespace}}({{$labels.instance}}): 发现{{$labels.pod}}下的{{$labels.container}}启动状态Unknown"
          value: "{{ $value }}"
          threshold: "1" 
      - alert: Etcd_leader
        expr: etcd_server_has_leader{job="kubernetes-etcd"} == 0
        for: 2s
        labels:
          severity: critical
          level: 4
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): 当前没有leader"
          value: "{{ $value }}"
          threshold: "0"
      - alert: Etcd_leader_changes
        expr: rate(etcd_server_leader_changes_seen_total{job="kubernetes-etcd"}[1m]) > 0
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): 当前leader已发生改变"
          value: "{{ $value }}"
          threshold: "0"
      - alert: Etcd_failed
        expr: rate(etcd_server_proposals_failed_total{job="kubernetes-etcd"}[1m]) > 0
        for: 2s
        labels:
          severity: warning
          level: 3
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}): ETCD服务失败"
          value: "{{ $value }}"
          threshold: "0"
      - alert: Etcd_db_total_size
        expr: etcd_debugging_mvcc_db_total_size_in_bytes{job="kubernetes-etcd"} > 10000000000
        for: 2s
        labels:
          severity: error
          level: 2
        annotations:
          description: "组件{{$labels.job}}({{$labels.instance}}) db空间超过10G"
          value: "{{ $value }}"
          threshold: "10G"
      - alert: Endpoint_ready
        expr: sum (increase (kube_endpoint_address_not_ready{}[5m])) by (namespace,pod) >0
        for: 5m
        labels:
          severity: error
          level: 2
        annotations:
          description: "空间{{$labels.namespace}}: 发现资源5分钟内多次存在不可用"
          value: "{{ $value }}"
          threshold: "1"
    # - name: 物理节点状态-监控告警
    #   rules:
      #- alert: 物理节点cpu使用率
      #  expr: 100-avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) by(instance)*100 > 90
      #  for: 2s
      #  labels:
      #    severity: ccritical
      #  annotations:
      #    summary: "{{ $labels.instance }}cpu使用率过高"
      #    description: "{{ $labels.instance }}的cpu使用率超过90%,当前使用率[{{ $value }}],需要排查处理"
      #- alert: 物理节点内存使用率
      #  expr: (node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)) / node_memory_MemTotal_bytes * 100 > 90
      #  for: 2s
      #  labels:
      #    severity: critical
      #  annotations:
      #    summary: "{{ $labels.instance }}内存使用率过高"
      #    description: "{{ $labels.instance }}的内存使用率超过90%,当前使用率[{{ $value }}],需要排���处理"
      
      #在kubernetes中无需开启,针对物理机或docker
      # - alert: InstanceDown
      #   expr: up == 0
      #   for: 2s
      #   labels:
      #     severity: critical
      #   annotations:   
      #     summary: "{{ $labels.instance }}: 服务器宕机"
      #     description: "{{ $labels.instance }}: 服务器延时超过2分钟"
      
      
      #- alert: 物理节点磁盘的IO性能
      #  expr: 100-(avg(irate(node_disk_io_time_seconds_total[1m])) by(instance)* 100) < 60
      #  for: 2s
      #  labels:
      #    severity: critical
      #  annotations:
      #     summary: "{{$labels.mountpoint}} 流入磁盘IO使用率过高！"
      #     description: "{{$labels.mountpoint }} 流入磁盘IO大于60%(目前使用:{{$value}})"
      # - alert: 入网流量带宽
      #   expr: ((sum(rate (node_network_receive_bytes_total{device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[5m])) by (instance)) / 100) > 102400
      #   for: 2s
      #   labels:
      #     severity: critical
      #   annotations:
      #     summary: "{{$labels.mountpoint}} 流入网络带宽��高！"
      #     description: "{{$labels.mountpoint }}流入网络带宽持续5分钟高于100M. RX带宽使用率{{$value}}"
      # - alert: 出网流量带宽
      #   expr: ((sum(rate (node_network_transmit_bytes_total{device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[5m])) by (instance)) / 100) > 102400
      #   for: 2s
      #   labels:
      #     severity: critical
      #   annotations:
      #     summary: "{{$labels.mountpoint}} 流出网络带宽过高！"
      #     description: "{{$labels.mountpoint }}流出网络带宽持续5分钟高于100M. RX带宽使用率{{$value}}"
      # - alert: TCP会话
      #   expr: node_netstat_Tcp_CurrEstab > 1000
      #   for: 2s
      #   labels:
      #     severity: critical
      #   annotations:
      #     summary: "{{$labels.mountpoint}} TCP_ESTABLISHED过高！"
      #     description: "{{$labels.mountpoint }} TCP_ESTABLISHED大于1000%(目前使用:{{$value}}%)"
      # - alert: 磁盘容量
      #   expr: 100-(node_filesystem_free_bytes{fstype=~"ext4|xfs"}/node_filesystem_size_bytes {fstype=~"ext4|xfs"}*100) > 80
      #   for: 2s
      #   labels:
      #     severity: critical
      #   annotations:
      #     summary: "{{$labels.mountpoint}} 磁盘分区使用率过高！"
      #     description: "{{$labels.mountpoint }} 磁盘分区使用大于80%(目前使用:{{$value}}%)"
      - alert: Kubernetes Node not Ready
        expr: kube_node_status_condition{condition="Ready",status="true"} == 0
        for: 10s
        labels:
          severity: critical
          level: 4
        annotations:
          summary: Kubernetes Node not ready (instance {{ $labels.instance }})
          description: "Node {{ $labels.node }} has been unready for a long time\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Memory Pressure
        expr: kube_node_status_condition{condition="MemoryPressure",status="true"} == 1
        for: 2m
        labels:
          severity: critical
          level: 4
        annotations:
          summary: Kubernetes memory pressure (instance {{ $labels.instance }})
          description: "{{ $labels.node }} has MemoryPressure condition\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Disk Pressure
        expr: kube_node_status_condition{condition="DiskPressure",status="true"} == 1
        for: 2m
        labels:
          severity: critical
          level: 4
        annotations:
          summary: Kubernetes disk pressure (instance {{ $labels.instance }})
          description: "{{ $labels.node }} has DiskPressure condition\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Out Of Disk
        expr: kube_node_status_condition{condition="OutOfDisk",status="true"} == 1
        for: 2m
        labels:
          severity: critical
          level: 4
        annotations:
          summary: Kubernetes out of disk (instance {{ $labels.instance }})
          description: "{{ $labels.node }} has OutOfDisk condition\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Out Of Capacity
        expr: sum by (node) ((kube_pod_status_phase{phase="Running"} == 1) + on(uid) group_left(node) (0 * kube_pod_info{pod_template_hash=""})) / sum by (node) (kube_node_status_allocatable{resource="pods"}) * 100 > 90
        for: 2m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes out of capacity (instance {{ $labels.instance }})
          description: "{{ $labels.node }} is out of capacity\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Container Oom Killer
        expr: (kube_pod_container_status_restarts_total - kube_pod_container_status_restarts_total offset 5m >= 1) and ignoring (reason) min_over_time(kube_pod_container_status_last_terminated_reason{reason="OOMKilled"}[5m]) == 1
        for: 1m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes container oom killer (instance {{ $labels.instance }})
          description: "Container {{ $labels.container }} in pod {{ $labels.namespace }}/{{ $labels.pod }} has been OOMKilled {{ $value }} times in the last 5 minutes.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Job Failed
        expr: kube_job_status_failed > 0
        for: 30s
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes Job failed (instance {{ $labels.instance }})
          description: "Job {{$labels.namespace}}/{{$labels.exported_job}} failed to complete\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Cronjob Suspended
        expr: kube_cronjob_spec_suspend != 0
        for: 5m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes CronJob suspended (instance {{ $labels.instance }})
          description: "CronJob {{ $labels.namespace }}/{{ $labels.cronjob }} is suspended\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Persistentvolumeclaim Pending
        expr: kube_persistentvolumeclaim_status_phase{phase="Pending"} == 1
        for: 2m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes PersistentVolumeClaim pending (instance {{ $labels.instance }})
          description: "PersistentVolumeClaim {{ $labels.namespace }}/{{ $labels.persistentvolumeclaim }} is pending\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Volume Out Of Disk Space
        expr: kubelet_volume_stats_available_bytes / kubelet_volume_stats_capacity_bytes * 100 < 10
        for: 2m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes Volume out of disk space (instance {{ $labels.instance }})
          description: "Volume is almost full (< 10% left)\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Volume Full In Four Days
        expr: predict_linear(kubelet_volume_stats_available_bytes[6h], 4 * 24 * 3600) < 0
        for: 10m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes Volume full in four days (instance {{ $labels.instance }})
          description: "{{ $labels.namespace }}/{{ $labels.persistentvolumeclaim }} is expected to fill up within four days. Currently {{ $value | humanize }}% is available.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Persistentvolume Error
        expr: kube_persistentvolume_status_phase{phase=~"Failed|Pending", job="kube-state-metrics"} > 0
        for: 2m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes PersistentVolume error (instance {{ $labels.instance }})
          description: "Persistent volume is in bad state\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Statefulset Down
        expr: (kube_statefulset_status_replicas_ready / kube_statefulset_status_replicas_current) != 1
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes StatefulSet down (instance {{ $labels.instance }})
          description: "A StatefulSet went down\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Hpa Scaling Ability
        expr: kube_horizontalpodautoscaler_status_condition{status="false", condition="AbleToScale"} == 1
        for: 2m
        labels:
          severity: notice
          level: 1
        annotations:
          summary: Kubernetes HPA scaling ability (instance {{ $labels.instance }})
          description: "Pod is unable to scale\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Hpa Metric Availability
        expr: kube_horizontalpodautoscaler_status_condition{status="false", condition="ScalingActive"} == 1
        for: 10s
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes HPA metric availability (instance {{ $labels.instance }})
          description: "HPA is not able to collect metrics\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Hpa Scale Capability
        expr: kube_horizontalpodautoscaler_status_desired_replicas >= kube_horizontalpodautoscaler_spec_max_replicas
        for: 2m
        labels:
          severity: notice
          level: 1
        annotations:
          summary: Kubernetes HPA scale capability (instance {{ $labels.instance }})
          description: "The maximum number of desired Pods has been hit\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Pod Not Healthy
        expr: min_over_time(sum by (namespace, pod) (kube_pod_status_phase{phase=~"Pending|Unknown|Failed"})[15m:1m]) > 0
        for: 2m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes Pod not healthy (instance {{ $labels.instance }})
          description: "Pod has been in a non-ready state for longer than 15 minutes.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Pod Crash Looping
        expr: increase(kube_pod_container_status_restarts_total[5m]) > 3
        for: 1m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes pod crash looping,Pod在5分钟内 连续重启超过3次 (instance {{ $labels.instance }})
          description: "Pod {{ $labels.pod }} is crash looping\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Replicasset Mismatch
        expr: kube_replicaset_spec_replicas != kube_replicaset_status_ready_replicas
        for: 1m
        labels:
          severity: notice
          level: 1
        annotations:
          summary: Kubernetes ReplicasSet mismatch (instance {{ $labels.instance }})
          description: " Replicas mismatch\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Deployment Replicas Mismatch
        expr: kube_deployment_spec_replicas != kube_deployment_status_replicas_available
        for: 1m
        labels:
          severity: notice
          level: 1
        annotations:
          summary: Kubernetes Deployment replicas mismatch (instance {{ $labels.instance }})
          description: "Deployment Replicas mismatch\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Statefulset Replicas Mismatch
        expr: kube_statefulset_status_replicas_ready != kube_statefulset_status_replicas
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes StatefulSet replicas mismatch (instance {{ $labels.instance }})
          description: "A StatefulSet does not match the expected number of replicas.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Deployment Generation Mismatch
        expr: kube_deployment_status_observed_generation != kube_deployment_metadata_generation
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes Deployment generation mismatch (instance {{ $labels.instance }})
          description: "A Deployment has failed but has not been rolled back.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Statefulset Generation Mismatch
        expr: kube_statefulset_status_observed_generation != kube_statefulset_metadata_generation
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes StatefulSet generation mismatch (instance {{ $labels.instance }})
          description: "A StatefulSet has failed but has not been rolled back.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Statefulset Update Not Rolled Out
        expr: max without (revision) (kube_statefulset_status_current_revision unless kube_statefulset_status_update_revision) * (kube_statefulset_replicas != kube_statefulset_status_replicas_updated)
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes StatefulSet update not rolled out (instance {{ $labels.instance }})
          description: "StatefulSet update has not been rolled out.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Daemonset Rollout Stuck
        expr: kube_daemonset_status_number_ready / kube_daemonset_status_desired_number_scheduled * 100 < 100 or kube_daemonset_status_desired_number_scheduled - kube_daemonset_status_current_number_scheduled > 0
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes DaemonSet rollout stuck (instance {{ $labels.instance }})
          description: "Some Pods of DaemonSet are not scheduled or not ready\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Daemonset Misscheduled
        expr: kube_daemonset_status_number_misscheduled > 0
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes DaemonSet misscheduled (instance {{ $labels.instance }})
          description: "Some DaemonSet Pods are running where they are not supposed to run\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Cronjob TooLong
        expr: time() - kube_cronjob_next_schedule_time > 3600
        for: 1m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes CronJob too long (instance {{ $labels.instance }})
          description: "CronJob {{ $labels.namespace }}/{{ $labels.cronjob }} is taking more than 1h to complete.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Job Slow Completion
        expr: kube_job_spec_completions - kube_job_status_succeeded > 0
        for: 12h
        labels:
          severity: error
          level: 2
        annotations:
          summary: Kubernetes job slow completion (instance {{ $labels.instance }})
          description: "Kubernetes Job {{ $labels.namespace }}/{{ $labels.job_name }} did not complete in time.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes ApiServer Errors
        expr: sum(rate(apiserver_request_total{job="apiserver",code=~"^(?:5..)$"}[1m])) / sum(rate(apiserver_request_total{job="apiserver"}[1m])) * 100 > 3
        for: 2m
        labels:
          severity: critical
          level: 4
        annotations:
          summary: Kubernetes API server errors (instance {{ $labels.instance }})
          description: "Kubernetes API server is experiencing high error rate\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Api Client Errors
        expr: (sum(rate(rest_client_requests_total{code=~"(4|5).."}[1m])) by (instance, job) / sum(rate(rest_client_requests_total[1m])) by (instance, job)) * 100 > 1
        for: 2m
        labels:
          severity: critical
          level: 4
        annotations:
          summary: Kubernetes API client errors (instance {{ $labels.instance }})
          description: "Kubernetes API client is experiencing high error rate\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Client Certificate Expires Next Week
        expr: apiserver_client_certificate_expiration_seconds_count{job="apiserver"} > 0 and histogram_quantile(0.01, sum by (job, le) (rate(apiserver_client_certificate_expiration_seconds_bucket{job="apiserver"}[5m]))) < 7*24*60*60
        for: 10m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes client certificate expires next week (instance {{ $labels.instance }})
          description: "A client certificate used to authenticate to the apiserver is expiring next week.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Client Certificate Expires Soon
        expr: apiserver_client_certificate_expiration_seconds_count{job="apiserver"} > 0 and histogram_quantile(0.01, sum by (job, le) (rate(apiserver_client_certificate_expiration_seconds_bucket{job="apiserver"}[5m]))) < 24*60*60
        for: 0m
        labels:
          severity: critical
          level: 4
        annotations:
          summary: Kubernetes client certificate expires soon (instance {{ $labels.instance }})
          description: "A client certificate used to authenticate to the apiserver is expiring in less than 24.0 hours.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"
      - alert: Kubernetes Api Server Latency
        expr: histogram_quantile(0.99, sum(rate(apiserver_request_latencies_bucket{subresource!="log",verb!~"^(?:CONNECT|WATCHLIST|WATCH|PROXY)$"} [10m])) WITHOUT (instance, resource)) / 1e+06 > 1
        for: 2m
        labels:
          severity: warning
          level: 3
        annotations:
          summary: Kubernetes API server latency (instance {{ $labels.instance }})
          description: "Kubernetes API server has a 99th percentile latency of {{ $value }} seconds for {{ $labels.verb }} {{ $labels.resource }}.\n  VALUE = {{ $value }}\n  LABELS = {{ $labels }}"

      # - alert: Jvm Memory Filling Up
      #   expr: (sum by (instance)(jvm_memory_used_bytes{area="heap"}) / sum by (instance)(jvm_memory_max_bytes{area="heap"})) * 100 > 80
      #   for: 2m
      #   labels:
      #     severity: warning
      #   annotations:
      #     summary: JVM memory filling up (instance {{ $labels.instance }})
      #     description: "JVM memory is filling up (> 80%) \n  VALUE = {{ $value }}\n LABELS = {{ $labels }}"
      # redis
      - alert: RedisTooManyConnections
        expr: redis_connected_clients > 1000
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: Redis too many connections (instance {{ $labels.instance }})
          description: "Redis:  {{ $labels.pod }}连接数过多,已经大于1000"
      # - alert: RedisNotEnoughConnections
      #   expr: redis_connected_clients < 5
      #   for: 2m
      #   labels:
      #     severity: warning
      #   annotations:
      #     summary: Redis not enough connections (instance {{ $labels.instance }})
      #     description: "Redis 连接数过少,现连接数小于5"
      - alert: RedisRejectedConnections
        expr: increase(redis_rejected_connections_total[1m]) > 0
        for: 3m
        labels:
          severity: error
          level: 2
        annotations:
          summary: Redis rejected connections (instance {{ $labels.instance }})
          description: "与redis:  {{ $labels.pod }} 的某些连接被拒绝"
```
## 二、创建alertManger配置
```
#alertmanager-conf.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
  labels:
    name: alertmanager-config
data:
  config.yml: |
    global:
      # 经过此时间后，如果尚未更新告警，则将告警声明为已恢复。(即prometheus没有向alertmanager发送告警了)
      resolve_timeout: 5m

      smtp_smarthost: 'xxx.xxx.com:587'  #登陆邮件进行查看
      smtp_from: 'xxx.xxx@gmail.com' #根据自己申请的发件邮箱进行配置
      smtp_auth_username: 'xxx.xxx@gmail.com'
      smtp_auth_password: 'xxxxxxxx'
      
      # 企微
      wechat_api_url: 'https://qyapi.weixin.qq.com/cgi-bin/'    # 企业微信的api_url，无需修改
      wechat_api_corp_id: 'xxxxxxxxxx'      # 企业微信中企业ID
      wechat_api_secret: 'xxxxxxxxxxxxx'      # 企业微信中，Prometheus应用的Secret

    #告警模板
    templates:
    - '/etc/templates/*.tmpl'
    
      # 所有报警都会进入到这个根路由下，可以根据根路由下的子路由设置报警分发策略

    route:      #分组
      # 先解释一下分组，分组就是将多条告警信息聚合成一条发送，这样就不会收到连续的报警了。
      # 将传入的告警按标签分组(标签在prometheus中的rules中定义)，例如：
      # 接收到的告警信息里面有许多具有cluster=A 和 alertname=LatencyHigh的标签，
      # 这些个告警将被分为一个组。
      # 如果不想使用分组，可以这样写group_by: [...]
      group_by: ['instance']

      # 第一组告警发送通知需要等待的时间，这种方式可以确保有足够的时间为同一分组获取多个告警，
      # 然后一起触发这个告警信息。
      group_wait: 10s

      # 发送第一个告警后，等待"group_interval"发送一组新告警
      group_interval: 5m

      # 分组内发送相同告警的时间间隔。这里的配置是每1小时发送告警到分组中。
      # 举个例子：收到告警后，一个分组被创建，等待10分钟发送组内告警，
      # 如果后续组内的告警信息相同,这些告警会在1小时后发送，但是1小时内这些告警不会被发送。
      repeat_interval: 1h
      
      # 这里先说一下，告警发送是需要指定接收器的，接收器在receivers中配置，
      # 接收器可以是email、webhook、pagerduty、wechat等等。一个接收器可以有多种发送方式。
      # 指定默认的接收器
      receiver: 'Prometheusalert-Notice'


      ## 下面配置的是子路由，子路由的属性继承于根路由(即上面的配置)，在子路由中可以覆盖根路由的配置
 
      routes: 
        - match:
            severity: warning
          receiver: 'Prometheusalert-critical'
        - match:
            severity: critical
          receiver: 'Prometheusalert-critical'
        - match:
            alertName: wechat
          receiver: 'wechat_receiver'
       
 
    #     # 下面是关于inhibit(抑制)的配置，先说一下抑制是什么：抑制规则允许在另一个警报正在触发的情况下使一组告警静音。其实可以理解为告警依赖。比如一台数据库服务器掉电了，会导致db监控告警、网络告警等等，可以配置抑制规则如果服务器本身down了，那么其他的报警就不会被发送出来。
 
    # inhibit_rules:
    # #下面配置的含义：当有多条告警在告警组里时，并且他们的标签alertname,cluster,service都相等，如果severity: 'critical'的告警产生了，那么就会抑制severity: 'warning'的告警。
    # - source_match:  # 源告警(我理解是根据这个报警来抑制target_match中匹配的告警)
    #     severity: 'critical' # 标签匹配满足severity=critical的告警作为源告警
    #   target_match:  # 目标告警(被抑制的告警)
    #     severity: 'warning'  # 告警必须满足标签匹配severity=warning才会被抑制。
    #   equal: ['alertname', 'cluster', 'service']  # 必须在源告警和目标告警中具有相等值的标签才能使抑制生效。(即源告警和目标告警中这三个标签的值相等'alertname', 'cluster', 'service')
 
 
    # 下面配置的是接收器
    receivers:
    # 以下为接收器Prometheusalert-Notice的配置
    - name: 'Prometheusalert-Notice'
      webhook_configs:
      - url: 'http://prometheus-alert-center.monitoring.svc.cluster.local:8080/prometheusalert?type=fs&tpl=prometheus-fs&fsurl=https://open.larksuite.com/open-apis/bot/v2/hook/560d8211-xxxxxxxxxx'

    ## 以下为接收器Prometheusalert-critical的配置
    - name: 'Prometheusalert-critical'
      email_configs:
      - to: 'xxxxxx@gmail.com'
        send_resolved: true    #告警恢复通知-开启
        html: '{{ template "email.html" . }}'  #此处通过html指定模板文件中定义的email.html模板
    - name: 'wechat_receiver'
      wechat_configs:
        - message: '{{ template "wechat.default.message" . }}'
          to_party: '2'         # 企业微信中创建的接收告警的告警部门ID
          to_user: '@all'
          agent_id: '1000002'     # 企业微信中创建应用的AgentId
          api_secret: 'xxxxxxxxxxxxx'      # 企业微信中，Prometheus应用的Secret
          send_resolved: true
```