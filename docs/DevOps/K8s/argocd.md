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
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - host: argocd.kubemsb.com
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