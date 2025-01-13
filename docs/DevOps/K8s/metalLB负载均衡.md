# MetalLB负载均衡 适合本地测试
## 安装 MetalLB
如果 kube-proxy 使用的是 ipvs 模式，需要修改 kube-proxy 配置文件，启用严格的 ARP
```bash
kubectl edit configmap -n kube-system kube-proxy

ipvs:
  strictARP: true
```
使用yaml安装
```bash
curl -O https://raw.githubusercontent.com/metallb/metallb/refs/tags/v0.14.9/config/manifests/metallb-native.yaml
kubectl appy -f metallb-native.yaml
```

## Layer 2 模式配置
1. 创建 IPAdressPool
```bash
cat <<EOF > IPAddressPool.yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: ip-pool
  namespace: metallb-system
spec:
  addresses:
  # 可分配的 IP 地址,可以指定多个，包括 ipv4、ipv6
  - 172.20.175.140-172.20.175.150
EOF

kubectl apply -f IPAddressPool.yaml
```

2. 创建 L2Advertisement，并关联 IPAdressPool
如果不设置关联到 IPAdressPool，那默认 L2Advertisement 会关联上所有可用的 IPAdressPool
```bash
cat <<EOF > L2Advertisement.yaml
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: example
  namespace: metallb-system
spec:
  ipAddressPools:
  - ip-pool #上一步创建的 ip 地址池，通过名字进行关联
EOF

kubectl apply -f L2Advertisement.yaml
```