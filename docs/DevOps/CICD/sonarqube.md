# 代码质量检查平台
## 安装
[官方文档](https://docs.sonarsource.com/sonarqube-server/latest/setup-and-upgrade/overview/)

## 集成到Jenkins
1. 安装插件SonarQube Scanner
2. 在sonarqube生成api key
3. 在Jenkins全局凭据中配置sonarqube api key
4. 在流水线中添加扫描代码的步骤
```groovy

```