# CI部分
## 主机需要安装的集成工具
### kustmozie
https://gh-proxy.com/https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv5.5.0/kustomize_v5.5.0_linux_arm64.tar.gz

### gitlab-runner
安装
```
# Replace ${arch} with any of the supported architectures, e.g. amd64, arm, arm64
# A full list of architectures can be found here https://s3.dualstack.us-east-1.amazonaws.com/gitlab-runner-downloads/latest/index.html
curl -LJO "https://s3.dualstack.us-east-1.amazonaws.com/gitlab-runner-downloads/latest/rpm/gitlab-runner-helper-images.rpm"
curl -LJO "https://s3.dualstack.us-east-1.amazonaws.com/gitlab-runner-downloads/latest/rpm/gitlab-runner_${arch}.rpm"
```
配置
```bash
vi /etc/gitlab-runner/config.toml
  # 设置为enable
  [runners.custom_build_dir]
    enable=true
```

## 项目代码发布示例
### 编写Dockerfile
```bash
# 使用 Node.js 镜像作为基础镜像（构建阶段）
FROM node:18 AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 切换到阿里云 npm 镜像 安装依赖
RUN npm config set registry https://registry.npmmirror.com/ && npm install

# 将Dockfile所在目录的所有文件复制到容器内当前目录 即/app下
COPY . .

# 构建 VitePress 静态文件
RUN npm run build

# 使用 Nginx 镜像作为生产镜像（运行阶段）
FROM nginx:alpine

# 将构建产物拷贝到 Nginx 的 web 根目录
COPY --from=builder /app/.vitepress/dist /usr/share/nginx/html

# 暴露 Nginx 默认端口
EXPOSE 80

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]
```
### 资源清单
- Deployment
```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vitepress
  labels:
    app: vitepress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vitepress
  template:
    metadata:
      labels:
        app: vitepress
    spec:
      containers:
      - name: vitepress
        image: 115.120.192.187/frontend/vitepress:latest # 替换为 CI/CD 构建的镜像地址
        ports:
        - containerPort: 80
```
- Service/Ingress
```bash
apiVersion: v1
kind: Service
metadata:
  name: vitepress
spec:
  selector:
    app: vitepress
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
---
# 可选
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vitepress-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: your-domain.com # 替换为实际的域名
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: vitepress
            port:
              number: 80
```
- kustomization
```bash
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# 声明资源
resources:
  - deploy.yml
  - svc.yml
```
### 编写gitlab-ci流水线文件
```bash
stages:
  - build
  - deploy

variables:
  HARBOR_REGISTRY: 115.120.192.187/frontend # Harbor 的镜像仓库地址
  DOCKER_IMAGE: $HARBOR_REGISTRY/vitepress:latest # 完整的镜像名称
  KUBECONFIG: /kubeconfig # Kubernetes 配置文件路径

# 构建阶段
build:
  stage: build
  image: docker:20.10 # 使用 Docker 镜像作为 Runner
  services:
    - docker:20.10-dind # 启动 Docker-in-Docker 服务
  script:
    - echo "Logging into Harbor"
    - echo "$HARBOR_PASSWORD" | docker login -u "$HARBOR_USER" --password-stdin $HARBOR_REGISTRY # 若没有开启https需要配置insecure-registries
    - echo "Building Docker image"
    - docker build -t $DOCKER_IMAGE . # 构建镜像
    - echo "Pushing Docker image to Harbor"
    - docker push $DOCKER_IMAGE # 推送镜像到 Harbor
```

### 开放者绑定远程仓库
```
git remote add gitlab ssh://git@192.168.153.100:8022/vitepress/vitepress.git
git checkout -b dev
```

# CD部分
## 使用ArgoCD
1. Settings中配置Project
2. 添加Repositories
3. Project中设置仓库、目标k8s地址、集群资源白名单
4. 创建新App