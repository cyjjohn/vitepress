# LDAP

## 概念

**一个统一的地方集中管理你的用户和群组授权。**

> 轻型目录访问协议（英文：Lightweight Directory Access Protocol，缩写：LDAP）是一个开放的，中立的，工业标准的应用协议，通过 IP 协议提供访问控制和维护分布式信息的目录信息。
> OpenLDAP 是轻型目录访问协议（Lightweight Directory Access Protocol，LDAP）的自由和开源的实现，在其 OpenLDAP 许可证下发行，并已经被包含在众多流行的 Linux 发行版中。

## 安装 OpenLDAP

安装 OpenLDAP 非常简单，直接安装这 3 个东西就够了，甚至运气好的话，也许你的操作系统已经自带安装好了：
`yum install openldap openldap-clients openldap-servers`
安装完了之后可以直接启动 OpenLDAP 服务，不需要做任何配置：
`systemctl start slapd.service`

## 配置 OpenLDAP

**配置 OpenLDAP 的正确方式是通过 ldapmodify 命令执行 LDIF 文件，而不是直接修改配置文件。**

### 1. 查看当前数据库配置

首先需要确定你的数据库类型和编号：

```bash
ls /etc/openldap/slapd.d/cn=config/
```

输出示例：

```
cn=module{0}.ldif
cn=schema/
cn=schema.ldif
olcDatabase={0}config.ldif
olcDatabase={-1}frontend.ldif
olcDatabase={1}monitor.ldif
olcDatabase={2}bdb/
olcDatabase={2}bdb.ldif
```

关键信息：

- `olcDatabase={2}bdb.ldif` - 这里的 `{2}` 是数据库编号，`bdb` 是数据库类型
- 常见的数据库类型有：`bdb`、`mdb`、`hdb`
- 你需要记住这个编号和类型，后面配置时会用到

### 2. 创建配置 LDIF 文件

创建一个配置文件，要注意数据库，例如 `modify_rootdn.ldif`：

```ldif
dn: olcDatabase={2}bdb,cn=config
changetype: modify
replace: olcRootDN
olcRootDN: cn=admin,dc=cyjjohn,dc=top
-
replace: olcSuffix
olcSuffix: dc=cyjjohn,dc=top
```

**LDIF 文件解释：**

- `dn:` - 指定要修改的对象，格式为 `olcDatabase={编号}{类型},cn=config`
- `changetype: modify` - 指定操作类型为修改
- `replace:` - 替换指定属性的值（类似 SQL 的 UPDATE）
- `olcRootDN:` - 设置 LDAP 管理员的完整 DN（Distinguished Name）
- `olcSuffix:` - 设置 LDAP 目录树的根后缀
- `-` - 分隔符，用于分隔不同的修改操作

**DN 格式说明：**

- `cn=admin` - Common Name，用户名部分
- `dc=cyjjohn,dc=top` - Domain Component，域名部分（cyjjohn.top）

### 3. 执行配置

使用 `ldapmodify` 命令应用配置：

```bash
ldapmodify -Q -Y EXTERNAL -H ldapi:/// -f modify_rootdn.ldif
```

**命令参数解释：**

- `ldapmodify` - LDAP 修改命令
- `-Q` - 安静模式，减少输出信息
- `-Y EXTERNAL` - 使用 EXTERNAL SASL 认证机制（通过 Unix socket 进行本地认证）
- `-H ldapi:///` - 指定连接方式为本地 Unix socket
- `-f` - 指定要执行的 LDIF 文件

### 4. 设置管理员密码

生成密码哈希：

```bash
slappasswd -s your_password
```

创建密码配置文件 `set_rootpw.ldif`：

```ldif
dn: olcDatabase={2}bdb,cn=config
changetype: modify
replace: olcRootPW
olcRootPW: {SSHA}生成的密码哈希值
```

这会输出类似 `{SSHA}xxxxx` 的哈希值，将其复制到 LDIF 文件中。

然后执行：

```bash
ldapmodify -Q -Y EXTERNAL -H ldapi:/// -f set_rootpw.ldif
```

## 验证配置

检查配置是否生效：

```bash
ldapsearch -Q -Y EXTERNAL -H ldapi:/// -b cn=config "(olcDatabase={2}bdb)"
```

## 使用 phpLDAPadmin
```bash
# 上面管理员密码设置为123456 bind_pass注意修改
docker run --name phpldapadmin \
  --env PHPLDAPADMIN_LDAP_HOSTS="#PYTHON2BASH:[{'ldap-server': [{'server': [{'host': '192.168.153.100'}, {'port': 389}, {'tls': False}]}, {'login': [{'bind_id': 'cn=admin,dc=cyjjohn,dc=top'}, {'bind_pass': '123456'}]}]}]" \
  --env PHPLDAPADMIN_HTTPS=false \
  --env PHPLDAPADMIN_LDAP_CLIENT_TLS=false \
  -p 8080:80 \
  --detach osixia/phpldapadmin:latest
```
你现在可以通过 URL 地址访问 phpLDAPadmin 了，登录的时候输入你那一坨用户名：cn=admin,dc=cyjjohn,dc=top，然后输入密码
