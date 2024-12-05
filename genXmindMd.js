import path from "path";
import fs from "fs";

export function genXmindMd(publicDir, xmindDir) {
  // 扫描 public 目录下的 .xmind 文件
  fs.readdir(publicDir, (err, files) => {
    if (err) {
      console.error("Unable to scan directory:", err);
      return;
    }

    files.forEach((file) => {
      if (file.endsWith(".xmind")) {
        const fileNameWithoutExt = path.basename(file, ".xmind");
        const mdFilePath = path.join(xmindDir, `${fileNameWithoutExt}.md`);

      // 检查文件是否已经存在
      if (fs.existsSync(mdFilePath)) {
        console.log(`File already exists, skipping: ${mdFilePath}`);
        return;
      }

        const mdContent = `
<script setup>
  import XmindViewer from '@/XmindViewer'
</script>

<XmindViewer url="/${file}"/>
`;

        // 写入 .md 文件
        fs.writeFileSync(mdFilePath, mdContent.trim(), "utf8");
        console.log(`Generated: ${mdFilePath}`);
      }
    });
  });
}

genXmindMd("./docs/public","./docs/Xmind")