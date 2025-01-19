import { DefaultTheme, defineConfig } from "vitepress";
import path from 'path'
import {genSidebar} from '../genSidebar'

const SRC_DIR = "./docs"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: SRC_DIR,
  title: "cyjjohn的博客",
  description: "我的编程技术博客",
  lang: "zh-CN",
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../components'),
      },
      extensions: ['.vue', '.js', '.json'],
    },
  },
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
  ],
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    search: {
      provider: "local",
    },

    editLink: {
      pattern: "https://github.com/cyjjohn/vitepress/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },

    nav: [
      { text: "Home", link: "/" },
      {
        text: "DevOps",
        items: [
          { text: "Kubernetes系列", link: "/DevOps/K8s/k8s搭建" },
          { text: "ElasticSearch系列", link: "/DevOps/ES/ElasticSearch资源清单" },
          { text: "Prometheus系列", link: "/DevOps/Prometheus/Prometheus基于kubernetes告警规则-告警等级划分" },
          { text: "CICD系列", link: "/DevOps/CICD/GitOps" },
        ],
      },
      {
        text: "操作系统",
        items: [
          { text: "Linux", link: "/OS/Linux/Linux_centos_LVM分区挂盘" },
          { text: "Mac", link: "/OS/Mac/Mac安装使用HomeBrew" },
        ],
      },
      {
        text: "前端",
        items: [
          { text: "JavaScript", link: "/Frontend/JavaScript/正则表达式的分组匹配" },
          {
            text: "React",
            link: "/Frontend/React/vite创建react标准化项目流程",
          },
          { text: "Utils", link: "/Frontend/Utils/使用plop生成模板代码" },
        ],
      },
      {
        text: "后端",
        items: [
          {
            text: "NestJS",
            link: "/Backend/NestJS/nestJS+typeORM+graphQL+前端",
          },
        ],
      },
      {
        text: "Xmind",
        items: [
          { text: "git", link: "/Xmind/git" },
          { text: "快捷键", link: "/Xmind/快捷键" },
          { text: "typescript", link: "/Xmind/typescript" },
        ],
      },
      {
        text: "Links",
        items: [
          { text: "MDN", link: "https://developer.mozilla.org/zh-CN/docs/Web" },
          { text: "Markdown语法速查", link: "https://markdown.com.cn/cheat-sheet.html" },
        ],
      },
    ],

    sidebar: genSidebar(SRC_DIR) as DefaultTheme.Config["sidebar"],
    // sidebar: {
    //   // 路径匹配与路由匹配类似 link路径要以'/'开头 不然会有bug
    //   "/DevOps/K8s": [
    //     {
    //       text: "K8s 系列",
    //       collapsed: false,
    //       items: [
    //         {
    //           text: "k8s搭建",
    //           link: "/DevOps/K8s/k8s搭建",
    //         },
    //       ],
    //     },
    //   ],
    //   "/DevOps/Prometheus": [
    //     {
    //       text: "Prometheus 系列",
    //       collapsed: false,
    //       items: [
    //         {
    //           text: "资源清单",
    //           link: "/DevOps/Prometheus/资源清单",
    //         },
    //         {
    //           text: "alertManager告警规则",
    //           link: "/DevOps/Prometheus/Prometheus基于kubernetes告警规则-告警等级划分",
    //         },
    //       ],
    //     },
    //   ],
    //   "/Frontend/React": [
    //     {
    //       text: "React使用",
    //       collapsed: false,
    //       items: [
    //         {
    //           text: "vite创建react标准化项目流程标准化项目流程",
    //           link: "/Frontend/React/vite创建react标准化项目流程",
    //         },
    //         {
    //           text: "react测试",
    //           link: "/Frontend/React/vite+vitest 测试react网页app",
    //         },
    //       ],
    //     },
    //   ],
    //   "/Frontend/Utils": [
    //     {
    //       text: "一些前端工具和配置",
    //       collapsed: false,
    //       items: [
    //         {
    //           text: "使用plop生成模板代码",
    //           link: "/Frontend/Utils/使用plop生成模板代码",
    //         },
    //         {
    //           text: "commit-lint规范",
    //           link: "/Frontend/Utils/commit-lint规范",
    //         },
    //         {
    //           text: "vscode别名自动提示",
    //           link: "/Frontend/Utils/vscode别名自动提示",
    //         },
    //       ],
    //     },
    //     {
    //       text: "数据转换",
    //       collapsed: false,
    //       items: [
    //         { text: "数据可视化-Echarts5", link: "/Frontend/Utils/数据可视化-Echarts5" },
    //         {
    //           text: "coordtransform、Geohash优化计算距离",
    //           link: "/Frontend/Utils/coordtransform、Geohash优化计算距离",
    //         },
    //       ],
    //     },
    //   ],
    //   "/Backend/NestJS": [
    //     {
    //       text: "一些前端工具和配置",
    //       collapsed: false,
    //       items: [
    //         {
    //           text: "nestJS+typeORM+graphQL+前端",
    //           link: "/Backend/NestJS/nestJS+typeORM+graphQL+前端",
    //         },
    //         {
    //           text: "使用JWT保持登录状态",
    //           link: "/Backend/NestJS/nestJS 使用JWT保持登录状态",
    //         },
    //       ],
    //     },
    //   ],
    //   "/OS/Linux": [
    //     {
    //       text: "Linux的一些使用",
    //       collapsed: false,
    //       items: [
    //         {
    //           text: "Linux centos LVM分区挂盘",
    //           link: "/OS/Linux/Linux_centos_LVM分区挂盘",
    //         },
    //         {
    //           text: "服务化并配置自动重启",
    //           link: "/OS/Linux/服务化并配置自动重启",
    //         },
    //         { text: "网络共享盘与挂载", link: "/OS/Linux/网络共享盘与挂载" },
    //       ],
    //     },
    //   ],
    //   "/OS/Mac": [
    //     {
    //       text: "Mac的一些使用",
    //       collapsed: false,
    //       items: [
    //         {
    //           text: "Mac安装使用HomeBrew",
    //           link: "/OS/Mac/Mac安装使用HomeBrew",
    //         },
    //       ],
    //     },
    //   ],
    //   "/Links": [
    //     {
    //       text: "Examples",
    //       collapsed: false,
    //       items: [
    //         { text: "Markdown Examples", link: "/Links/markdown-examples" },
    //         { text: "Runtime API Examples", link: "/Links/api-examples" },
    //       ],
    //     },
    //   ],
    // },

    socialLinks: [{ icon: "github", link: "https://github.com/cyjjohn" }],
  },
});
