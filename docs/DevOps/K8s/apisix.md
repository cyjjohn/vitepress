# APISIX 
云原生网关 可替代ingress-nginx-controller
有dashboard可视化界面
## 部署
[官方指南](https://apisix.apache.org/zh/docs/apisix/installation-guide/)
## APISIX配置
常用修改
```yml
# 服务类型修改为负载均衡
service:
  # -- Apache APISIX service type for user access itself
  type: LoadBalancer
  annotations:
    lb.kubesphere.io/v1alpha1: openelb

# 允许所有ip访问
allow:
  # -- The client IP CIDR allowed to access Apache APISIX Admin API service.
  ipList:
    - 0.0.0.0/24

# 打开dashboard
dashboard:
  enabled: true
  service: 
    type: LoadBalancer

# 使用ingress-controller
ingress-controller:
  enabled: true
  config:
    apisix:
      adminAPIVersion: "v3"
      serviceNamespace: apisix-system # 指定名称空间否则找不到apisix-admin
```