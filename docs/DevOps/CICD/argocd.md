## 安装Argo CD
官方资源清单
https://gh-proxy.com/https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.3/manifests/install.yaml

## 获取初始密码
`k -n argocd get secrets argocd-initial-admin-secret -o jsonpath='{..password}'|base64 -d`

## 默认必须有TLS证书才能访问 添加一下内容使用http
```yml
# 找到argocd-server启动命令 添加参数 --insecure
vim install.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/component: server
    app.kubernetes.io/name: argocd-server
    app.kubernetes.io/part-of: argocd
  name: argocd-server
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-server
    spec:
      containers:
      - args:
        - /usr/local/bin/argocd-server
        - --insecure  # 添加这行内容
```

## 使用ingress访问
```yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
  namespace: argocd
spec:
  ingressClassName: nginx
  rules:
  - host: argocd.com
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: argocd-server
            port:
              number: 80
```

## 安装ingress控制器
官方资源清单
https://gh-proxy.com/https://raw.githubusercontent.com/kubernetes/ingress-nginx/refs/tags/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml

## 确保LoadBalancer正常
本地环境需安装metalLB用于测试

## 设置HOSTS
在/etc/hosts中添加LoadBalancer绑定的地址