---
title: 'SVGR 設置'
path: blog/20210725-2
tags: [javascript]
date: 2021-07-25
excerpt: webpack loader 以 Component 方式使用 Svg。
---

### [SVGR](https://www.npmjs.com/package/@svgr/webpack)
* Webpack loader for SVGR
    `npm install @svgr/webpack --save-dev`
* `webpack.config.js`
    ```
    {
    test: /\.svg$/,
    use: ['@svgr/webpack'],
    }
    ```
* 預設&使用svgr用法
    ```jsx
    import starUrl, { ReactComponent as Star } from './star.svg'
    
    const App = () => (
    <div>
        <img src={starUrl} alt="star" />
        <Star />
    </div>
    )
    ```
* typescript 要宣告行別 `.d.ts`
    ```javascript
    declare module '*.svg' {
    import React = require('react');

    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
    }
    ```
* 跑 jest test 要 mock svg
    ```
    "jest": {
        ...
        "moduleNameMapper": {
        "\\.svg$": "<rootDir>/__mocks__/mock-icon.js",
        },
        ...
    }
    ```
    ```javascript
    // mock-icon.js
    module.exports = { ReactComponent: 'icon-mock' }
    ```

---

話說有時候在下載設計稿的 svg 檔後，可以自行把寬告顏色拿掉，保留在 code 中操作其樣式的彈性。（上份公司都是包好放阿里巴的 iconfont 直接使用，個人覺得非常方便，但也有解析度缺陷，就看公司標準了）