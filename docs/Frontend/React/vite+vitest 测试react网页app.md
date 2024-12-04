# vite+vitest 测试react网页app

# 安装依赖

```jsx
npm i -D vitest
// jsdom环境让vitest能模拟浏览器 
// @testing-library/jest-dom是jest的html测试库
// @testing-library/react是react测试库
npm i -D jsdom @testing-library/jest-dom @testing-library/react
```

# 配置

## vite.config中添加test配置

```jsx
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    test: {
			// 全局引用
      globals: true,
      environment: 'jsdom',
			setupFiles: './test/setup.ts',
    }
})
```

## 编写setup启动文件，会在每次test前执行

```jsx
// ./test/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
```