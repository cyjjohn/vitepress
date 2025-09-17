# zookeeper集群部署
## 下载
[官网下载](https://zookeeper.apache.org/releases.html)
```sh
wget https://dlcdn.apache.org/zookeeper/zookeeper-3.9.3/apache-zookeeper-3.9.3-bin.tar.gz
tar zxvf apache-zookeeper-3.9.3-bin.tar.gz
mv apache-zookeeper-3.9.3-bin /opt/zookeeper
```

## 修改配置
```sh
cd /opt/zookeeper/conf
cp zoo_sample.cfg zoo.cfg

vi zoo.cfg
# 修改dataDir为实际
dataDir=/opt/data/zookeeper
# 添加节点
server.1=worker1:2888:3888
server.2=worker2:2888:3888

# dataDir中创建myid，指定id，各节点不要重复
echo "1" > /opt/data/zookeeper/myid  # worker1
echo "2" > /opt/data/zookeeper/myid  # worker2
```

## 环境变量
```sh
cat << EOF > /etc/profile.d/zookeeper.sh
export ZOOKEEPER_HOME=/opt/zookeeper
export PATH=\$PATH:\$ZOOKEEPER_HOME/bin
EOF

source /etc/profile.d/zookeeper.sh
```

## 启动、验证
```sh
zkServer.sh start
zkServer.sh status

# 显示以下内容，mode可能是follower或leader
ZooKeeper JMX enabled by default
Using config: /opt/zookeeper/bin/../conf/zoo.cfg
Client port found: 2181. Client address: localhost. Client SSL: false.
Mode: follower
```