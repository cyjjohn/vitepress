## 安装Argo CD
官方资源清单
https://gh-proxy.com/https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.3/manifests/install.yaml

## 获取初始密码
`k -n argocd get secrets argocd-initial-admin-secret -o jsonpath='{..password}'|base64 -d`

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