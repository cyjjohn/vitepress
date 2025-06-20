## tips
- @SpringBootApplication默认只扫描所在目录及子目录的Component，想从自定义common模块导入要添加注解@ComponentScan("com.xxx")
- 默认读取resource和resource/config下配置，如果引入common模块，需要注意会优先读取common模块的配置，建议common模块不要有配置
- 网关可以加上java参数-Dreactor.netty.http.server.accessLogEnabled=true，能打印url请求地址
- 批量更新要考虑是否需要先remove
- 数据库查询出的list要考虑是否可能为空
- 批量操作都应该考虑是否要用事务
- 如果遇到第三方依赖中使用spring.factories，由于在springboot3被移除了，可以将依赖库中自动装配内容放在META-INF/spring/springframework.boot.autoconfigure.Autoconfiguration.imports