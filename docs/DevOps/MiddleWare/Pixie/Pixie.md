# 部署Pixie
## Pixie Cloud 部署
1. 克隆仓库
```sh
git clone https://github.com/pixie-io/pixie.git
cd pixie
```
2. 选择latest版本
```sh
export LATEST_CLOUD_RELEASE=$(git tag | perl -ne 'print $1 if /release\/cloud\/v([^\-]*)$/' | sort -t '.' -k1,1nr -k2,2nr -k3,3nr | head -n 1)
echo $LATEST_CLOUD_RELEASE
```
3. 切换版本
```sh
git checkout "release/cloud/v${LATEST_CLOUD_RELEASE}"
```
4. 更新对应kustomization文件的版本
```sh
perl -pi -e "s|newTag: latest|newTag: \"${LATEST_CLOUD_RELEASE}\"|g" k8s/cloud/public/kustomization.yaml
```
5. 更改域名
Pixie Cloud 默认域名 dev.withpixie.dev，如要修改，需要改配置将dev.withpixie.dev替换掉
```sh
export CUSTOM_DOMAIN=www.cyj.com
sed -i "s/dev.withpixie.dev/${CUSTOM_DOMAIN}/g" k8s/cloud/public/base/proxy_envoy.yaml
# 默认端口4444 可在domain_config.yaml修改
sed -i "s/dev.withpixie.dev/${CUSTOM_DOMAIN}/g" k8s/cloud/public/base/domain_config.yaml
sed -i "s/dev.withpixie.dev/${CUSTOM_DOMAIN}/g" scripts/create_cloud_secrets.sh
```
6. 安装mkcert
```sh
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```
7. 使用mkcert创建证书
```sh
mkcert -install
```
8. 创建命名空间plc
```sh
kubectl create namespace plc
```
9. 创建secrets
```sh
./scripts/create_cloud_secrets.sh
```
10. 安装kustomize
[官方指南](https://kubectl.docs.kubernetes.io/installation/kustomize/)
11. 部署Pixie Cloud依赖
> 如果gcr.io访问不了，替换成gcr.nju.edu.cn或gcr.m.daocloud.io
```sh
kustomize build k8s/cloud_deps/base/elastic/operator | kubectl apply -f -
kustomize build k8s/cloud_deps/public | kubectl apply -f -
```
12. 部署Pixie Cloud
```sh
kustomize build k8s/cloud/public/ | kubectl apply -f -
```
13. 暴露service
/k8s/cloud/overlays/exposed_services_nginx/
```yml
spec:
  ingressClassName: nginx
  tls:
  - hosts:  # 修改域名
    - pixie.example.com
    - work.pixie.example.com
    secretName: cloud-proxy-tls-certs
  rules:
  - host: pixie.example.com  # 修改域名
  - host: work.pixie.example.com # 修改域名 前缀为work.
```