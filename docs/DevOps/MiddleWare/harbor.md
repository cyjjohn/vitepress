# Harbor 镜像仓库
## 下载
由于 Harbor 整体透过 Docker Compose 安装，所以进行 Harbor 安装以前要先准备好 Docker Compose 环境
- Docker安装:
```
[root@harbor ~]# yum install -y yum-utils
[root@harbor ~]# yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
[root@harbor ~]# yum install -y docker-ce
```
- Docker Comopose
```
https://github.com/docker/compose/releases
[root@harbor ~]# curl -L https://github.com/docker/compose/releases/download/<version>/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
#添加执行权限
[root@harbor ~]# chmod +x /usr/local/bin/docker-compose
#验证
[root@harbor ~]# docker-compose --version
```
- Harbor
```
https://github.com/goharbor/harbor/releases
```

## 修改配置harbor.yml
1. hostname修改
2. port修改
3. https禁用或修改
4. 管理员密码修改

## 安装Harbor
```bash
tar xf harbor-xxx.tar.gz -C /opt/
cd /opt/harbor/
./prepare
./install.sh
```

## 如果安装完后想修改配置
```bash
cd /path/to/harbor
vi harbor.yml
./prepare
docker-compose down
docker-compose up -d
```

## 镜像命名
全名格式: <Harbor地址>/<仓库名>/<镜像名>:<版本>
```
# 将镜像打上标签
docker tag <image id> <镜像名>
```

## daemon.json中配置(docker)
由于没启用ssl，需要添加配置
```
vim /etc/docker/daemon.json
{
    "insecure-registries": ["<Harbor地址>:5000"]
}
```

## containerd配置
```
vim /etc/containerd/config.toml
---
[plugins."io.containerd.grpc.v1.cri".registry]
   config_path = "/etc/containerd/certs.d"
[plugins."io.containerd.grpc.v1.cri".registry.configs."115.120.192.187".auth]
  username="admin"
  password="Harbor1234"
---

# 默认读取config_path/<host_namespace>/hosts.toml
mkdir -p /etc/containerd/certs.d/115.120.192.187/
vi /etc/containerd/certs.d/115.120.192.187/hosts.toml
---
# 默认似乎会使用https访问私有仓库 server这里写https 下面host写http
server = "https://115.120.192.187"

[host."http://115.120.192.187"]
  capabilities = ["pull", "resolve", "push"]
  skip_verify = true
---
```

## 推送到Harbor仓库
```
# 登录
docker login -u admin -p <密码> <Harbor地址>
# 推送
docker push <镜像全名>
```

## 在容器内的jenkins使用宿主机docker命令
```bash
chown root:root /var/run/docker.sock
chmod o+rw /var/run/docker.sock

# 映射 docker数据卷
/var/run/docker.sock:/var/run/docker.sock
/usr/bin/docker:/usr/bin/docker
/etc/docker/daemon.json:/etc/docker/daemon.json
```

## 让客户端接受jenkins参数并执行脚本部署
```bash
vi deploy.sh
---
horbar_addr=$1
horbar_repo=$2
project=$3
version=$4
port=$5

imageName=$horbar_addr/$horbar_repo/$project:$version

# 检查当前容器是否存在，若存在则删除
containerId=`docker ps -a | grep $[project} | awk '{print $1}'`
if [ $containerId != '' ] ; then
  docker stop $containerId
  docker rm $containerId
fi
# 检查当前镜像是否存在，若存在则删除
tag=`docker images | grep ${project) | awk '{print $2}'`
# 只有 [[ 命令支持 =~ 操作符，其右边的字符串被认为是一个扩展正则表达式
if [[ $tag =~ $version ]] ; then
  docker rmi -f $imageName
fi

docker login -u admin -p Harbor12345 $horbar_addr
docker pull $imageName
docker run -d -p $port:$port --name project $imageName

echo "SUCCESS"
---
```