# vite创建标准化项目流程

## vite 创建项目

`npm create vite@latest my-react-app --template react-ts`

## prettier 格式化规范

安装prettier依赖

`npm install prettier eslint-config-prettier eslint-plugin-prettier --save-dev`

.prettierrc.cjs按自己习惯设置

```jsx
module.exports = {
  useTabs: false,
  printWidth: 100, //单行长度
  tabWidth: 2, //缩进长度
  semi: false, //句末使用分号
  singleQuote: true, //使用单引号
  arrowParens: 'avoid', //单参数箭头函数省略圆括号
  proseWrap: 'preserve', //换行方式
  endOfLine: 'lf', //行结束符
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 70,
        useTabs: false,
        trailingComma: 'none',
        arrowParens: 'avoid',
        proseWrap: 'never',
      },
    },
    {
      files: '*.{json,babelrc,eslintrc,remarkrc,prettierrc}',
      options: {
        useTabs: false,
      },
    },
  ],
}
```

.vscode/settings.json设置编辑器自动格式化

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 安装husky

```jsx
npm install husky -D
npm pkg set scripts.prepare="husky install"
npm run prepare
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm run format"
npx husky add .husky/pre-commit "git add ."
```

## 安装commit-lint

```jsx
npm install --save-dev @commitlint/config-conventional @commitlint/cli
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```