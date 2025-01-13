import path from "path";
import fs from "fs";

// 获取指定目录下的所有 Markdown 文件路径
function getFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList); // 递归获取子目录的文件
    } else if (file.endsWith(".md")) {
      fileList.push(filePath); // 仅处理 Markdown 文件
    }
  });

  return fileList;
}

// 动态添加文件到分组中，支持嵌套
function addToSidebarGroup(
  group: any[],
  parts: string[],
  fileName: string,
  link: string
) {
  const [current, ...rest] = parts;

  if (!current) return; // 如果没有路径部分，直接返回

  // 查找当前分组是否已存在
  let currentGroup = group.find((item: any) => item.text === current);
  if (!currentGroup) {
    currentGroup = {
      text: current,
      collapsed: false,
      items: [],
    };
    group.push(currentGroup);
  }

  if (rest.length === 0) {
    // 如果是文件，直接添加到当前分组
    currentGroup.items.push({ text: fileName, link });
  } else {
    // 如果是目录，递归处理
    addToSidebarGroup(currentGroup.items, rest, fileName, link);
  }
}

// 生成侧边栏配置
export function genSidebar(baseDir: string) {
  const files = getFiles(baseDir); // 获取所有 Markdown 文件
  const sidebar: { [key: string]: any[] } = {}; // 最终的侧边栏配置对象

  files.forEach((file) => {
    const relativePath = path.relative(baseDir, file); // 获取文件的相对路径
    const parts = relativePath.split(path.sep); // 根据路径分隔符拆分目录
    const fileName = parts.pop()!.replace(".md", ""); // 获取文件名（无扩展名）
    const groupPath = `/${parts.join("/")}`; // 当前文件所属的分组路径
    const link = `/${relativePath.replace(/\\/g, "/").replace(".md", "")}`; // 文件的链接

    // 第一层目录作为顶级组路径
    const topLevelGroup = `/${parts.slice(0, 2).join("/")}`; // 保留前两层目录（如 /DevOps/ES）

    // 初始化分组
    if (!sidebar[topLevelGroup]) {
      sidebar[topLevelGroup] = [];
    }

    // 按分组添加文件
    addToSidebarGroup(sidebar[topLevelGroup], parts.slice(1), fileName, link);
  });

  return sidebar;
}
