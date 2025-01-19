## 常用插件

- Git Parameter
- Publish Over SSH

## 流水线语法

```
// 所有命令都要放在pipeline里
pipeline {
  // 指定任务在哪个节点处理
  agent any

  // 声明全局变量
  environment {
    key = 'value'
  }

  // 步骤
  stages {
    stage('拉取Git仓库代码') {
      steps {
        checkout scmGit(branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/cyjjohn/vitepress.git']])
        echo '拉取Git仓库代码 - 成功'
      }
    }
    stage('通过node构建项目') {
      steps {
        echo '通过node构建项目 - 成功'
      }
    }
    stage('ssh推送') {
      steps {
        // 注意ssh连接后默认路径为~
        sshPublisher(publishers: [sshPublisherDesc(configName: 'test', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'echo \'test success\' > a.txt', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '', remoteDirectorySDF: false, removePrefix: '', sourceFiles: '')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
        echo 'ssh推送 - 成功'
      }
    }
  }

  // 推送消息
  post {
    success {
      emailext subject: "构建成功 #${env.BUILD_NUMBER}",
      body: "构建成功！详情请查看：${env.BUILD_URL}",
      to: "team@example.com"
    }
    failure {
      emailext subject: "构建失败 #${env.BUILD_NUMBER}",
      body: "构建失败！详情请查看：${env.BUILD_URL}",
      to: "team@example.com"
    }
  }
}
```
