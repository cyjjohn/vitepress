const fs = require('fs');
const path = require('path');

// 设置要检查的根目录路径
const directoryPath = path.join(__dirname, 'docs/');

// 根目录要忽略的目录列表
const ignoreDirs = ['Xmind', 'anotherDir']; // 在这里添加其他要忽略的目录名称
console.log(`已忽略目录:%c${ignoreDirs}`,'color:red')

// 递归获取所有Markdown文件，忽略指定目录
function getMarkdownFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        
        // 检查是否为目录并排除指定目录
        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoreDirs.includes(path.basename(fullPath))) {
                arrayOfFiles = getMarkdownFiles(fullPath, arrayOfFiles);
            }
        } else if (path.extname(file) === '.md') {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// 检查文件内容
function checkFileForHtmlCharacters(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    let inCodeBlock = false;
    let issuesFound = false;

    lines.forEach((line, index) => {
        if (line.trim().startsWith('``')) {
            inCodeBlock = !inCodeBlock; // 反转代码块状态
        }

        // 不在代码块内 不是引用块
        if (!inCodeBlock && !line.trim().startsWith('> ') && (line.includes('<') || line.includes('>'))) {
            console.log(`在文件 ${filePath} 的第 %c${index + 1}`,'color:red',`行发现未转义字符：${line.trim()}`);
            issuesFound = true;
        }
    });

    return issuesFound;
}

// 执行检查
const markdownFiles = getMarkdownFiles(directoryPath);
let overallIssuesFound = false;

markdownFiles.forEach((file) => {
    const issuesInFile = checkFileForHtmlCharacters(file);
    if (issuesInFile) {
        overallIssuesFound = true;
    }
});

if (!overallIssuesFound) {
    console.log('所有文件中的非代码块部分均未发现未转义的<和>字符。');
}
