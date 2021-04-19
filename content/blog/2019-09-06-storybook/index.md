---
title: '初探 Storybook'
path: blog/20190906
tags: [javascript]
date: 2019-09-06
excerpt: 初探這款能夠在開發前端元件或是函式庫的同時，可以快速地建立元件各種操作模式或是樣式的工具。
---

[Storybook Guides](https://storybook.js.org/docs/guides/guide-react/)

![](https://i.imgur.com/186Ecqp.png)

> TDD (Test Driven Development)
> : 先寫測試再開發程式
> 定義一些 user story 做需求分析，規劃撰寫程式時所要尊循的程序
>
> ![](https://i.imgur.com/2gXymfv.png)

註：BDD (Behavior-driven development)  
則是比起 TDD 更進一步，除了在實作前先寫測試外，測試前還要先寫通過自然語言定義系統行為的可以執行的規格

- 2019/6/29 發布 v5.1.9 與先前版本差異較大
- 方便開發 UI 元件
- **視覺測試**元件在每個狀態下的外觀（也有[快照測試](https://www.learnstorybook.com/react/zh-TW/simple-component/) addon）
- 作為共同維護的文件，日後好交接
- 與應用程式的業務邏輯和上下文隔離開來，耦合高的元件難以抽出單獨重現
- [Live Examples](https://storybook.js.org/docs/basics/live-examples/)<br><br>

團隊好從 Components 開始分工並開發

---

## Setup (React)

### React 專案自動設定 Storybook

`npx -p @storybook/cli sb init --type react`

### React 專案手動設定 Storybook

1. `npm install @storybook/react --save-dev`
2. Make sure that you have `react`, `react-dom`, `@babel/core`, and `babel-loader` in your dependencies
3. `package.json` scripts add `"storybook": "start-storybook"`
4. root add `.storybook/config.js` with

   ```javascript
   import { configure } from '@storybook/react';

   function loadStories() {
     require('../stories/index.js');
     // You can require as many stories as you need.

     // 或引入所有符合規則檔
     // const req = require.context('../stories', true, /\.stories\.js$/);
     // req.keys().forEach(filename => req(filename));
   }

   configure(loadStories, module);
   ```

   註：[require.context](https://webpack.js.org/guides/dependency-management/#requirecontext)

5. root add `stories/index.js` with

   ```javascript
   import React from 'react';
   import { storiesOf } from '@storybook/react';
   import { Button } from '@storybook/react/demo';

   storiesOf('Button', module)
     .add('with text', () => <Button>Hello Button</Button>)
     .add('with emoji', () => (
       <Button>
         <span role="img" aria-label="so cool">
           😀 😎 👍 💯
         </span>
       </Button>
     ));
   ```

6. run storybook `npm run storybook`
   - package.json script [可以設定](https://storybook.js.org/docs/configurations/cli-options/) 如 -p 設固定 port

## React + Antd + Storybook

要載入 antd & scss 檔需手動做 [`webpack.config.js`](https://storybook.js.org/docs/configurations/custom-webpack-config/) 設定

1. 方法一
   .storybook/webpack.config.js

   ```javascript
   const path = require('path');

   module.exports = async ({ config, mode }) => {
     config.module.rules.push({
       test: /\.less$/,
       loaders: [
         'style-loader',
         'css-loader',
         {
           loader: 'less-loader',
           options: {
             modifyVars: {
             ...
             },
             javascriptEnabled: true,
           },
         },
       ],
     });

     return config;
   };
   ```

   .storybook/config.js
   `import 'antd/dist/antd.less';`

2. 方法二
   .storybook/webpack.config.js

   ```javascript
   const path = require('path');

   module.exports = async ({ config, mode }) => {
     config.module.rules.push({
       loader: 'babel-loader',
       exclude: /node_modules/,
       test: /\.(js|jsx)$/,
       options: {
         presets: ['@babel/react'],
         plugins: [
           [
             'import',
             {
               libraryName: 'antd',
               libraryDirectory: 'es',
               style: true,
             },
           ],
         ],
       },
     });

     config.module.rules.push({
       test: /\.less$/,
       loaders: [
         'style-loader',
         'css-loader',
         {
           loader: 'less-loader',
           options: {
             modifyVars: {
             ...
             },
             javascriptEnabled: true,
           },
         },
       ],
       include: [
         path.resolve(__dirname, '../src'),
         /[\\/]node_modules[\\/].*antd/,
       ],
     });

     return config;
   };
   ```

#### .storybook/config.js 載入檔案設定

```javascript
import { configure } from '@storybook/react';

const req = require.context('../stories', true, /\.stories\.js$/);

function loadStories() {
  // require('../stories/index.js');
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
```

#### [addParameters](https://storybook.js.org/docs/configurations/options-parameter/)

設置 Storybook 版面（optional）

#### [addDecorator](https://storybook.js.org/docs/addons/introduction/)

刻制元件顯示的區塊佈景配置

```javascript
const styles = {
  textAlign: 'center',
};
const CenterDecorator = (storyFn) => <div style={styles}>{storyFn()}</div>;
addDecorator(CenterDecorator);
```

## Using addons

常用擴充 storybook 功能像是：看事件觸發、看元件 notes、[看元件 properties 定義](https://www.npmjs.com/package/@storybook/addon-knobs)（須先寫好 stories）

1. `npm install @storybook/addons @storybook/addon-actions @storybook/addon-knobs @storybook/addon-notes`
2. add `.storybook/addons.js` with

```javascript
// 版面功能 Tab 順序跟 import 順序有關
import '@storybook/addon-actions/register'; // 可寫觸發事件log
import '@storybook/addon-knobs/register'; // 可寫props定義預設值並輸入修改
import '@storybook/addon-notes/register'; // 可寫說明筆記
import '@storybook/addon-storysource/register'; // 可看使用的stories片段程式碼(註)
```

註 .storybook/webpack.config.js

```javascript
config.module.rules.push({
  test: /\.stories\.jsx?$/,
  loaders: [
    {
      loader: require.resolve('@storybook/addon-storysource/loader'),
      options: {
        prettierConfig: {
          printWidth: 100,
          singleQuote: false,
        },
      },
    },
  ],
  enforce: 'pre',
});
```

[addon gallery](https://storybook.js.org/addons/) 可以尋找適合的 addons
沒適合的也可以[自己寫 addon](https://storybook.js.org/docs/addons/writing-addons/)

---

## 遇到問題

1. 元件所需 localstorage
2. HOC 元件
3. 無法輕易將有容器 container 的 component 單獨抽出
