# Logstash

## Filebeat.yml

## Logstash.yml

## 数据流 根据label自动区分
### 方案 1：通过 Filebeat Autodiscover动态设置字段
在 Filebeat 的配置文件（filebeat.yml）中，启用 autodiscover 并动态设置字段：
```yaml
filebeat.autodiscover:
  providers:
  - type: kubernetes
    # Kubernetes API 的访问配置，确保 Filebeat 能访问 K8s 集群
    hints.enabled: true
    # 仅采集带有特定标签的 Pod 日志
    templates:
      # - condition:
      #     equals:
      #       kubernetes.labels.log: "true"  # 只处理带有标签 log=true 的 Pod
      - config:
          - type: container
            paths:
              - /var/log/containers/*-${data.kubernetes.container.id}.log
            multiline:
              pattern: '^\d{4}-\d{2}-\d{2}'  # 多行日志的正则匹配（例如 Java 堆栈）
              negate: true
              match: after
            processors:
              - add_kubernetes_metadata:
                  in_cluster: true  # 自动添加 Kubernetes 元数据
              - dissect:
                tokenizer: "%{kubernetes.labels.app}"  # 动态从 Pod 的 labels 中获取日志分类 例如pod标签为app:nginx则会取nginx
                field: "app"  #此处命名与下面dataset中一致
              - add_fields:
                target: "data_stream"
                fields:
                  dataset: "${data.app:generic}"  # 动态从 label 中获取 dataset
                  type: "default"
              - drop_fields:
                  fields: ["host"]  # 可根据需要移除不必要的字段
```
通过给 Pod 添加 labels，Filebeat 会自动将日志分类到不同的 Data Stream 中。例如：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tomcat-pod
  labels:
    app: tomcat   # 动态分类所使用的字段
spec:
  containers:
    - name: tomcat
      image: tomcat:latest
      ports:
        - containerPort: 8080
```
**数据流命名规则示例**
当日志由 Filebeat 发送到 Logstash 或 Elasticsearch 时：
- Pod 的 log_category 标签值为 tomcat 时：
数据流名为：logs-tomcat-default
- Pod 未设置 log_category 标签时：
数据流名为：logs-generic-default

### 方案 2：通过 Logstash 动态处理日志分类
如果使用 Logstash 作为日志转发器，可以在 Logstash 中动态处理来自 Filebeat 的日志，基于日志的内容或字段（如 kubernetes.labels）来自动分配 data_stream.dataset
```
filter {
  if [kubernetes][labels][log_category] {
    mutate {
      add_field => { "data_stream.dataset" => "%{[kubernetes][labels][log_category]}" }
    }
  } else {
    mutate {
      add_field => { "data_stream.dataset" => "generic" }
    }
  }

  mutate {
    add_field => { "data_stream.namespace" => "logs" }
    add_field => { "data_stream.type" => "default" }
  }
}
```

## 注意事项
- ES8以上默认使用Index Pattern