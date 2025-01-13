## 修改containerd镜像源
### 修改/etc/containerd/config.toml
```bash
cat <<EOF | tee -a /etc/containerd/config.toml
[plugins."io.containerd.grpc.v1.cri".registry.mirrors]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
    endpoint = ["https://hub.atomgit.com","docker.1ms.run"]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io/library"]
    endpoint = ["https://hub.atomgit.com/library","docker.1ms.run/library"]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."registry.k8s.io"]
    endpoint=["https://k8s.m.daocloud.io","https://dockerproxy.com"]
EOF
```
- kubernetes的命令行crictl与containerd通过cri连接
- 修改的是containerd的cri配置，命令行不要用ctr，而应该用crictl
- 代码中拉取地址可能包含libary，需要配置一下

### 重启containerd
``systemctl restart containerd``

## 验证镜像源是否修改成功
``containerd config dump | grep mirrors -A 5``