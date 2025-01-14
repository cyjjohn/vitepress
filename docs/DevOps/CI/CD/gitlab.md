## 下载镜像
`docker pull iabsdocker/gitlab-ce`
## 启动gitlab-ce
```bash
docker run 
-d                #后台运行，全称：detach
-p 8443:443      #将容器内部端口向外映射
-p 8090:80       #将容器内80端口映射至宿主机8090端口，这是访问gitlab的端口
-p 8022:22       #将容器内22端口映射至宿主机8022端口，这是访问ssh的端口
--restart always #容器自启动
--name gitlab    #设置容器名称为gitlab
-v /usr/local/gitlab/etc:/etc/gitlab    #将容器/etc/gitlab目录挂载到宿主机/usr/local/gitlab/etc目录下，若宿主机内此目录不存在将会自动创建
-v /usr/local/gitlab/etc/gitlab-rails:/opt/gitlab/embedded/service/gitlab-rails/config
-v /usr/local/gitlab/log:/var/log/gitlab
-v /usr/local/gitlab/data:/var/opt/gitlab
--privileged=true         #让容器获取宿主机root权限
iabsdocker/gitlab-ce   #镜像的名称，这里也可以写镜像ID
```
## 配置
/etc/gialab/gitlab.rb
```
# 在gitlab创建项目时候http地址的host(不用添加端口)
external_url 'http://xx.xx.xx.xx'
# 配置ssh协议所使用的访问地址和端口
gitlab_rails['gitlab_ssh_host'] = '192.168.XX.XX' //和上一个IP输入的一样
gitlab_rails['gitlab_shell_ssh_port'] = 8022 // 此端口是run时22端口映射的8022端
```

/opt/gitlab/embedded/service/gitlab-rails/config/gitlab.yml
```
# 与上面一致
host: xx.xx.xx.xx
port: xx
```

## 一些命令
```
//容器外停止
docker stop gitlab   // 这里的gitlab 就是我们上一步docker run 当中使用--name 配置的名字
//容器外重启
docker restart gitlab
//进入容器命令行
docker exec -it gitlab bash
//容器中应用配置，让修改后的配置生效
gitlab-ctl reconfigure
//容器中重启服务
gitlab-ctl restart
```

## 初始密码
/etc/gitlab/initial_root_password