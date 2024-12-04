# mac安装使用HomeBrew

## 1、修改~/.bash_profile文件(不存在该文件，自己新增)

```bash
//将Homebrew源替换成中科大的Homebrew源
export HOMEBREW_BREW_GIT_REMOTE="[https://mirrors.ustc.edu.cn/brew.git](https://mirrors.ustc.edu.cn/brew.git)"
export HOMEBREW_BREW_GIT_REMOTE="[https://mirrors.ustc.edu.cn/brew.git](https://mirrors.ustc.edu.cn/brew.git)"
export HOMEBREW_CORE_GIT_REMOTE="[https://mirrors.ustc.edu.cn/homebrew-core.git](https://mirrors.ustc.edu.cn/homebrew-core.git)"
export HOMEBREW_BOTTLE_DOMAIN="[https://mirrors.ustc.edu.cn/homebrew-bottles](https://mirrors.ustc.edu.cn/homebrew-bottles)"
export HOMEBREW_API_DOMAIN="[https://mirrors.ustc.edu.cn/homebrew-bottles/api](https://mirrors.ustc.edu.cn/homebrew-bottles/api)"
//增加Homebrew环境变量
export PATH="/opt/homebrew/bin:$PATH"
```

## 2、安装Homebrew

```bash
//需要能科学上网
/bin/bash -c "$(curl -fsSL https://github.com/Homebrew/install/raw/HEAD/install.sh)"
//如果不能科学上网，可以再试试中科大提供的安装链接
/bin/bash -c "$(curl -fsSL https://mirrors.ustc.edu.cn/misc/brew-install.sh)"
```

## 3、brew常用命令

```bash
# 搜索需要的软件，搜索结果会有cask和formulae之分，前者一般是带图形界面的软件，后者一般是命令行软件
brew search 软件名
 
# 安装软件，一般是先通过上面的搜索查看是否存在某软件再安装
brew install 软件名
# 安装带图形界面的软件(也就是上面搜索出来位于casks中的软件)
brew install --cask 软件名
 
# 查看通过brew安装的软件
brew list
 
# 卸载软件，如果不知道要写在哪个，可以先使用上面命令查看。list中列出的有些可能是某软件的依赖，不知道是否有用的软件经历不要卸载
brew uninstall 软件名
 
# 更新软件,如果不指定需要更新的软件，brew会更新所有需要更新的软件
brew upgrade [git]
 
# 更新brew
brew update
 
# 查看帮助
brew --help #查看brew可用的命令
brew 命令名 --help # 查看该命令可用的参数
```