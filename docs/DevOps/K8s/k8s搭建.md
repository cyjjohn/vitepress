# k8s搭建

## linux基础配置

### 一些初始化配置

```bash
# 修改主机名
hostnamectl set-hostname xxx && bash
# 编辑hosts
192.168.23.100 master1
192.168.23.101 master2
192.168.23.102 node1
# 关闭防火墙
systemctl stop firewalld && systemctl disable firewalld
# 关闭SELinux
setenforce 0
vim /etc/selinux/config
SELINUX=disabled

# 关闭swap
echo "vm.swappiness = 0">> /etc/sysctl.conf （尽量不使用交换分区，注意不是禁用）
sysctl -p (执行这个使其生效，不用重启)
关闭SWAP
swapoff -a
卸载swap
注释掉/etc/fstab中的swap

# 时间同步 高版本可直接执行
chronyc makestep
# 设置时区
timedatectl set-timezone Asia/Shanghai

# 机器间免密码登录
ssh-keygen
ssh-copy-id hostname

# 配置额外软件源
yum install epel-release -y
# 配置阿里云的yum源
wget -o /etc/yum.repos.d/Centos-7.repo http://mirrors.aliyun.com/repo/Centos-7.repo
# 修改$release和$basearch
sed -i 's/$releasever/7/g' Centos-7.repo

# 配置docker-ce 国内yum源 
yum install -y yum-utils
yum-config-manager --add-repo https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/centos/docker-ce.repo
# 安装containerd
yum install containerd.io -y


# container配置 注释解开
vi /etc/containerd/config.toml

version = 2
[plugins]
  [plugins."io.containerd.grpc.v1.cri"]
   [plugins."io.containerd.grpc.v1.cri".containerd]
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          runtime_type = "io.containerd.runc.v2"
          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            SystemdCgroup = true
[plugins."io.containerd.grpc.v1.cri".registry]
   config_path = "/etc/containerd/certs.d"

mkdir -p /etc/containerd/certs.d/docker.io
mkdir -p /etc/containerd/certs.d/registry.k8s.io

touch /etc/containerd/certs.d/docker.io/hosts.toml
touch /etc/containerd/certs.d/registry.k8s.io/hosts.toml
---
cat>/etc/containerd/certs.d/docker.io/hosts.toml<<EOF
server = "https://docker.io"

[host."https://dockerproxy.net/"]
  capabilities = ["pull", "resolve"]
EOF
---
cat>/etc/containerd/certs.d/registry.k8s.io/hosts.toml<<EOF
server = "registry.k8s.io"

[host."k8s.mirror.nju.edu.cn"]
  capabilities = ["pull", "resolve"]
EOF
---
systemctl restart containerd

# yum 的 --downloadonly 选项会下载指定包及其所有依赖包
yum install --downloadonly --downloaddir=/path/to/download/dir 包名
```

由于开启内核 ipv4 转发需要加载 br_netfilter 模块，所以加载下该模块：

```
$ modprobe br_netfilter
```

创建`/etc/sysctl.d/k8s.conf`文件，添加如下内容：

```
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
```

执行如下命令使修改生效：

```
$ sysctl -p /etc/sysctl.d/k8s.conf
```

### 安装 ipvs（所有节点）

```bash
yum -y install ipvsadm ipset
# 开启模块
modprobe ip_vs
modprobe ip_vs_rr
modprobe ip_vs_wrr
modprobe ip_vs_sh
modprobe nf_conntrack
# 模块是否加载成功
lsmod | grep ip_vs
```

## keepalive + nginx 部署高可用k8s api server

### 安装nginx主备

```bash
yum install -y nginx keepalived
yum install -y nginx-mod-stream
```

### 修改nginx配置/etc/nginx/nginx.conf

```bash
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

# 四层负载均衡，为两台Master apiserver组件提供负载均衡
stream {

    log_format  main  '$remote_addr $upstream_addr - [$time_local] $status $upstream_bytes_sent';

    access_log  /var/log/nginx/k8s-access.log  main;

    upstream k8s-apiserver {
       server 192.168.56.100:6443;   # Master1 APISERVER IP:PORT
       server 192.168.56.101:6443;   # Master2 APISERVER IP:PORT
    }
    
    server {
       listen 16443; # 由于nginx与master节点复用，这个监听端口不能是6443，否则会冲突
       proxy_pass k8s-apiserver;
    }
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    server {
        listen       80 default_server;
        server_name  _;

        location / {
        }
    }
}
```

### 配置keepalived

```bash
global_defs { 
   notification_email { 
     acassen@firewall.loc 
     failover@firewall.loc 
     sysadmin@firewall.loc 
   } 
   notification_email_from Alexandre.Cassen@firewall.loc  
   smtp_server 127.0.0.1 
   smtp_connect_timeout 30 
   router_id NGINX_MASTER
} 

vrrp_script check_nginx {
    script "/etc/keepalived/check_nginx.sh"
}

vrrp_instance VI_1 { 
    state MASTER 
    interface ens33 # 修改为实际网卡名
    virtual_router_id 100 # VRRP 路由 ID实例，每个实例是唯一的 主备一致
    priority 100    # 优先级，备服务器设置 90 
    advert_int 1    # 指定VRRP 心跳包通告间隔时间，默认1秒 
    authentication { 
        auth_type PASS      
        auth_pass 1111 
    }  
    # 虚拟IP
    virtual_ipaddress { 
        192.168.56.199/24
    } 
    track_script {
        check_nginx
    } 
}

#备节点
vrrp_instance VI_1 { 
    state BACKUP
    interface ens33 # 修改为实际网卡名
    virtual_router_id 100 # VRRP 路由 ID实例，每个实例是唯一的 主备一致
    priority 90    # 优先级，备服务器设置 90 
    advert_int 1    # 指定VRRP 心跳包通告间隔时间，默认1秒 
    authentication { 
        auth_type PASS      
        auth_pass 1111 
    }  
    # 虚拟IP
    virtual_ipaddress { 
        192.168.56.199/24
    } 
    track_script {
        check_nginx
    } 
}
```

### 检查脚本

```bash
#!/bin/bash
count=`ps -C nginx --no-header | wc -l`

if [ "$count" -eq 0 ];then
    exit 1
else
    exit 0
fi

# 添加权限
chmod 744 /etc/keepalived/check_nginx.sh
```

### 启动并验证

```bash
systemctl start keepalived && systemctl enable keepalived
systemctl start nginx && systemctl enable nginx 
ip a # 验证
```

## 初始化k8s

### 安装工具

```bash
# 添加源
cat > /etc/yum.repos.d/kubernetes.repo <<EOF
[kubernetes] 
name=Kubernetes 
baseurl=https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/
enabled=1 
gpgcheck=0 
EOF

# 安装 注意k8s版本
yum makecache
yum install -y kubelet kubeadm kubectl 
```

### 拉取镜像、使用本地镜像（可选）
```bash
# k8s v1.24移除了dockershim 不再支持docker
# 需要容器运行时(CRI) 如果使用containerd 本地镜像需要导入k8s.io名称空间
ctr -n k8s.io image pull ...
ctr -n k8s.io image import kube.tar
ctr -n k8s.io image -q
# 或者
crictl image ls
```

### kubeadm安装k8s
```bash
# kubeadm.yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: v1.30.3
controlPlaneEndpoint: 192.168.23.199:16443
imageRepository: registry.aliyuncs.com/google_containers
apiServer:
 certSANs:
 - 192.168.23.100
 - 192.168.23.101
 - 192.168.23.102
 - 192.168.23.199
networking:
  podSubnet: 10.244.0.0/16
  serviceSubnet: 10.10.0.0/16
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind:  KubeProxyConfiguration
mode: ipvs

# 初始化
kubeadm init --config kubeadm.yaml --v=5
# 查看日志
journalctl -xeu kubelet|less

# 根据提示输入命令 然后检查是否正常
kubectl get pods -n kube-system

# 然后加自启
systemctl enable kubelet

# 单master
kubeadm init --kubernetes-version=1.30.3 --apiserver-advertise-address=192.168.56.100 --image-repository=registry.aliyuncs.com/google_containers --pod-network-cidr=10.244.0.0/16 --service-cidr=10.10.0.0/16
ctr -n k8s.io image 

# 常见问题
# 使用的运行时containerd pause不翻墙下不到
ctr -n k8s.io image pull registry.aliyuncs.com/google_containers/pause:3.6
ctr -n k8s.io image tag registry.aliyuncs.com/google_containers/pause:3.6 registry.k8s.io/pause:3.6
```

### 添加控制节点

```bash
mkdir -p /etc/kubernetes/pki/etcd && mkdir -p ~/.kube

# 从master1复制证书到master2
scp /etc/kubernetes/pki/ca.* master2:/etc/kubernetes/pki/
scp /etc/kubernetes/pki/sa.* master2:/etc/kubernetes/pki/
scp /etc/kubernetes/pki/front-proxy-ca* master2:/etc/kubernetes/pki/
scp /etc/kubernetes/pki//etcd/ca* master2:/etc/kubernetes/pki/etcd

# 在master1查看加入命令
kubeadm token create --print-join-command
```

### 安装网络插件

```bash
# 注意k8s与calico版本对应
# calico支持k8s版本查看
# https://projectcalico.docs.tigera.io/getting-started/kubernetes/requirements
curl https://raw.githubusercontent.com/projectcalico/calico/master/manifests/calico.yaml -O
kubectl apply -f calico.yaml

# 问题
# mount-bpffs初始化失败
kubectl logs --container=mount-bpffs -n kube-system calico-node-vpx56
```

### 添加工作节点

```bash
kubeadm join 192.168.23.199:16443 --token 1y7a5v.v9do8bv5j8ei03b2 --discovery-token-ca-cert-hash sha256:c92ac58460046ea4c4aaa89cab066796e7f1ac8107fd2abb6c0b8a38017c4f28

# 在控制节点修改role
kubectl label node node1 node-role.kubernetes.io/worker=worker
```

### 创建临时pod验证是否可以正常

```bash
kubectl run busybox-pod --image busybox:latest --restart=Never --rm -it busybox -- sh
# 进入pod ping下
ping xxx
```

### 测试coredns

```bash
kubectl run busybox-pod --image busybox:latest --restart=Never --rm -it busybox -- sh
# 进入pod 
nslookup kubernetes.default.svc.cluster.local
```

## helm安装dashboard

### kubenetes-dashboard安装

```bash
# helm 命令
wget https://get.helm.sh/helm-v3.15.3-linux-amd64.tar.gz
tar -zxvf  helm-v3.15.3-linux-amd64.tar.gz
mv linux-amd64/helm /usr/local/bin/helm

# 添加 kubernetes-dashboard 仓库
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
# 使用 kubernetes-dashboard Chart 部署名为 `kubernetes-dashboard` 的 Helm Release
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard

# 查看pods日志
kubectl get all -n kubernetes-dashboard
kubectl -n kubernetes-dashboard describe pods kubernetes-dashboard-kong-xxx

#若初始化时calico存在问题
# ClusterInformation: connection is unauthorized: Unauthorized – Failed to create pod sandbox: rpc error
kubectl get pods -n kube-system --show-labels
kubectl delete pods -n kube-system -l k8s-app=calico-node
# 多网卡可能出现如下问题 需指定网卡
# calico/node is not ready: BIRD is not ready: Error querying BIRD: unable to connect to BIRDv4 socket: dial unix /var/run/calico/bird.ctl: connect: connection refused
# calico/node is not ready: BIRD is not ready: BGP not established
kubectl set env daemonset/calico-node -n kube-system IP_AUTODETECTION_METHOD=interface=eth0
netstat -anpt | grep bird


# 使dashboard能外网访问
# 修改为NodePort端口
kubectl edit svc -n kubernetes-dashboard kubernetes-dashboard-kong-proxy
# ClusterIP改为NodePort
type: NodePort
```

### 创建admin-user token

```bash
# 创建临时token
cat > dashboard-user.yaml << EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF
 
kubectl apply -f dashboard-user.yaml
kubectl -n kubernetes-dashboard create token admin-user

# 创建长期token 即把上面的secret存储下来
cat > dashboard-user-token.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/service-account.name: "admin-user"   
type: kubernetes.io/service-account-token  
EOF
 
kubectl apply -f dashboard-user-token.yaml
 
# 查看密码
kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d
```