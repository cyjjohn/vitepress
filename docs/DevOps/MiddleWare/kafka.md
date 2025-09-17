# kafka集群部署
## 1.准备服务器
### kafka服务
| 服务器名 | IP | 说明 |
| --- | --- | --- |
| kafka01 | 192.168.88.51 | Kafka节点1
| kafka02 | 192.168.88.52 | Kafka节点2
| kafka03 | 192.168.88.53 | Kafka节点3

### zookeeper服务
Kakfa集群需要依赖ZooKeeper存储Broker、Topic等信息，这里我们部署三台ZK
| 服务器名 | IP | 说明 |
| --- | --- | --- |
| zk01 | 192.168.88.1 | ZooKeeper节点1
| zk02 | 192.168.88.2 | ZooKeeper节点2
| zk03 | 192.168.88.3 | ZooKeeper节点3

部署过程参考：[zookeeper部署](/DevOps/MiddleWare/zookeeper.md)

## 2.下载
Kafka官方下载地址：https://kafka.apache.org/downloads
```bash
#创建并进入下载目录
mkdir /home/downloads
cd /home/downloads

#下载安装包
wget http://mirrors.tuna.tsinghua.edu.cn/apache/kafka/2.3.0/kafka_2.12-2.3.0.tgz 

#解压到应用目录
tar -zvxf kafka_2.12-2.3.0.tgz -C /usr/kafka
```

## 3.kafka配置
```bash
#进入应用目录
cd /usr/kafka/kafka_2.12-2.3.0/

#修改配置文件
vi config/server.properties
```

### 通用配置
配置日志目录、指定ZooKeeper服务器
```bash
log.dirs=/kafka/logs

# root directory for all kafka znodes.
zookeeper.connect=192.168.88.1:2181,192.168.88.2:2181,192.168.88.3:2181
```

### 分节点配置
- Kafka01
```bash
broker.id=1
listeners=PLAINTEXT://192.168.88.51:9092
```

- Kafka02
```bash
broker.id=2
listeners=PLAINTEXT://192.168.88.52:9092
```

- Kafka03
```bash
broker.id=3
listeners=PLAINTEXT://192.168.88.53:9092
```

## 4.启动kafka
```bash
#进入kafka根目录
cd /usr/kafka/kafka_2.12-2.3.0/
#启动
/bin/kafka-server-start.sh config/server.properties &

#启动成功输出示例(最后几行)
[2019-06-26 21:48:57,183] INFO Kafka commitId: fc1aaa116b661c8a (org.apache.kafka.common.utils.AppInfoParser)
[2019-06-26 21:48:57,183] INFO Kafka startTimeMs: 1561531737175 (org.apache.kafka.common.utils.AppInfoParser)
[2019-06-26 21:48:57,185] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
```

## 5.测试
### 创建Topic
在kafka01(Broker)上创建测试Tpoic：test，这里我们1个分区
```
bin/kafka-topics.sh --create --bootstrap-server 192.168.88.51:9092 --partitions 1 --topic test
```
### 查看Topic
```
bin/kafka-topics.sh --list --bootstrap-server 192.168.88.52:9092
```
### 发送消息
```
bin/kafka-console-producer.sh --broker-list 192.168.88.51:9092 --topic test

#消息内容
> aaa
```
### 消费消息
在Kafka03上消费Broker02的消息
```
bin/kafka-console-consumer.sh --bootstrap-server 192.168.88.52:9092 --topic test --from-beginning
```
在Kafka02上消费Broker03的消息
```
bin/kafka-console-consumer.sh --bootstrap-server 192.168.88.53:9092 --topic test-ken-io --from-beginning
```
均能收到消息 `aaa`
这是因为这两个消费消息的命令是建立了两个不同的Consumer
如果我们启动Consumer指定Consumer Group Id就可以作为一个消费组协同工，1个消息同时只会被一个Consumer消费到