## 核心概念

- Task: 定义一个可执行的步骤序列，例如构建镜像、运行测试等。
- Pipeline: 定义一个由多个 Task 组成的流水线，用于自动化 CI/CD 流程。
- TaskRun: Task 的一次执行实例。
- PipelineRun: Pipeline 的一次执行实例。
- PipelineResource (已弃用): 用于定义 Pipeline 的输入和输出资源，如 Git 仓库、镜像仓库等。（推荐使用 Workspaces 替代）
- Workspace: 用于在 Task 之间共享数据和资源。

## Tekton Pipelines 安装

### 在 k8s 中部署

```bash
kubectl apply --filename https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
```

### 查看

```bash
kubectl -n tekton-pipelines get pods
```

## Dashboard 安装

### 直接使用 k8s

```bash
kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/tekton-dashboard-release.yaml
```

### 使用安装脚本

```bash
curl -sL https://raw.githubusercontent.com/tektoncd/dashboard/main/scripts/release-installer | bash -s -- install latest --read-write
```

## Cli 工具

```bash
# 自行替换版本
curl -LO https://github.com/tektoncd/cli/releases/download/v0.41.0/tkn_0.41.0_Linux_x86_64.tar.gz
# Replace YOUR-DOWNLOADED-FILE with the file path of your own.
sudo tar xvzf YOUR-DOWNLOADED-FILE -C /usr/local/bin/ tkn
```

## Tekton 运行第一个 Task

### 运行 Task 和 Taskrun

```bash
kubectl apply -f taskrun.yml -f task.yml

# task.yml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: build-and-push-image
spec:
  params:
    - name: IMAGE
      type: string
      description: The Docker image to build and push
    - name: DOCKERFILE
      type: string
      description: Path to the Dockerfile
      default: Dockerfile
    - name: CONTEXT
      type: string
      description: The build context
      default: .
  steps:
    - name: build
      image: gcr.io/kaniko-project/executor:latest
      command: ["/kaniko/executor"]
      args:
        - "--dockerfile=$(params.DOCKERFILE)"
        - "--context=$(params.CONTEXT)"
        - "--destination=$(params.IMAGE)"

# taskrun.yml
apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
  name: build-and-push-taskrun
spec:
  taskRef:
    name: build-and-push-image
  params:
    - name: IMAGE
      value: "your-docker-registry/your-image:latest"
    - name: DOCKERFILE
      value: "path/to/your/Dockerfile"
```

## Tekton CLI (tkn) 管理 Tekton 资源

- 查看 Task: `tkn task list`
- 查看 Pipeline: `tkn pipeline list`
- 启动 TaskRun: `tkn task start your-task --param IMAGE=your-image:latest`
- 启动 PipelineRun: `tkn pipeline start your-pipeline --param IMAGE=your-image:latest`
- 查看 TaskRun/PipelineRun 日志: `tkn taskrun logs your-taskrun -f` 或 `tkn pipelinerun logs your-pipelinerun -f`

## 在 Pipeline 中指定 Task 的执行方式

### timeout

指定超时时间

### retries

失败情况下的重试次数

### runAfter

定义任务之间的顺序步骤

### params 参数传递

- **Pipeline 参数传递给 Task:** Pipeline 可以定义参数，并将这些参数传递给它所包含的 Task。

  ```yaml
  apiVersion: tekton.dev/v1beta1
  kind: Pipeline
  metadata:
    name: my-pipeline
  spec:
    params:
      - name: IMAGE_NAME
        type: string
        description: The name of the image to build
    tasks:
      - name: build-image
        taskRef:
          name: build-and-push
        params:
          - name: IMAGE
            value: $(params.IMAGE_NAME)
  ```

  在这个例子中，Pipeline 定义了一个名为 `IMAGE_NAME` 的参数，并将它的值传递给 `build-image` Task 的 `IMAGE` 参数。

- **Task 结果传递给后续 Task:** Task 可以定义结果 (results)，并将这些结果传递给后续的 Task。

  首先，在 Task 中定义 result：

  ```yaml
  apiVersion: tekton.dev/v1beta1
  kind: Task
  metadata:
    name: my-task
  spec:
    steps:
      - name: generate-result
        image: ubuntu
        script: |
          #!/usr/bin/env bash
          echo -n "my-result-value" | tee /tekton/results/my-result
    results:
      - name: my-result
        description: The value of my result
        value: $(steps.generate-result.results.my-result)
  ```

  然后，在 Pipeline 中使用 result：

  ```yaml
  apiVersion: tekton.dev/v1beta1
  kind: Pipeline
  metadata:
    name: my-pipeline
  spec:
    tasks:
      - name: task-1
        taskRef:
          name: my-task
      - name: task-2
        taskRef:
          name: another-task
        runAfter:
          - task-1
        params:
          - name: INPUT_VALUE
            value: $(tasks.task-1.results.my-result)
  ```

  在这个例子中，`task-1` 的 `my-result` 结果被传递给 `task-2` 的 `INPUT_VALUE` 参数。

## workspace 工作空间

- **`workspaces`:** Pipeline 使用 `workspaces` 来定义 Task 之间共享的存储空间。

  ```yaml
  apiVersion: tekton.dev/v1beta1
  kind: Pipeline
  metadata:
    name: my-pipeline
  spec:
    workspaces:
      - name: shared-data
        description: |
          This workspace is used to share data between the tasks in this pipeline.
    tasks:
      - name: fetch-source
        taskRef:
          name: git-clone
        workspaces:
          - name: output
            workspace: shared-data
      - name: build-image
        taskRef:
          name: build-and-push
        workspaces:
          - name: source
            workspace: shared-data
        runAfter:
          - fetch-source
  ```

  在这个例子中，`shared-data` Workspace 被 `fetch-source` Task 用于存储克隆的代码，然后被 `build-image` Task 用于构建镜像。
