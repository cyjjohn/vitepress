## 修改containerd镜像源
### 修改/etc/containerd/config.toml
```bash
[plugins."io.containerd.grpc.v1.cri".registry.mirrors]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
    endpoint = ["https://atomhub.openatom.cn"]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io/library"]
    endpoint = ["https://atomhub.openatom.cn/library"]
```
- kubernetes的命令行crictl与containerd通过cri连接
- 修改的是containerd的cri配置，命令行不要用ctr，而应该用crictl
- 代码中拉取地址可能包含libary，需要配置一下