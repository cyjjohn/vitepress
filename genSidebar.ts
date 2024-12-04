import path from "path";
import fs from "fs";
import { DefaultTheme } from "vitepress";

// 获取文件夹中的所有文件和文件夹
function getFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// 生成 sidebar 配置
export function genSidebar(baseDir: string) {
  const files = getFiles(baseDir);
  const sidebar = {};

  files.forEach((file) => {
    if (file.endsWith(".md")) {
      const relativePath = path.relative(baseDir, file);
      const parts = relativePath.split(path.sep); // 使用 path.sep 处理不同操作系统下的路径分隔符
      const category = parts.slice(0, -1).join("/");
      const fileName = parts[parts.length - 1].replace(".md", "");
      const text = fileName; // 可以根据需要从文件内容或文件名生成更友好的标题
      debugger;
      if (!sidebar[`/${category}`]) {
        sidebar[`/${category}`] = [
          {
            text: `${category.split("/").slice(-1)[0]} 系列`, // 使用最后一级目录名作为分组文本
            collapsed: false,
            items: [],
          },
        ];
      }

      sidebar[`/${category}`][0].items.push({
        text: text,
        link: `/${category}/${fileName}`,
      });
    }
  });

  return sidebar as DefaultTheme.Sidebar;
}