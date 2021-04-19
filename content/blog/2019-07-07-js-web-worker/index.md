---
title: 'JavaScript HTML5 Web Worker & CRA 使用踩雷'
path: blog/20190707
tags: [javascript]
date: 2019-07-07
excerpt: JavaScript 是單執行緒、單線程的程式語言，所有的程式碼片段都會在堆疊中被執行，Web worker 相當於可讓主線程開其他 thread。
---

JavaScript 是單執行緒、單線程（single threaded runtime）的程式語言，所有的程式碼片段都會在堆疊（主執行緒/Stack）中被執行，而且一次只會執行一個程式碼片段。Web worker 相當於可讓主線程開其他 thread。

W3C：A web worker is a JavaScript running in the background, without affecting the performance of the page.
這邊可以先看個簡介 [A Guide to using Web Workers in React](https://www.fullstackreact.com/articles/introduction-to-web-workers-with-react/)  
和這個 [codesandbox example](https://codesandbox.io/s/w2v7zzn63w) 感受一下有無使用 web worker 的 UI 體驗差別

可以應用在輪詢、處理大量計算的情境。

通訊使用先記得：不管主線程還是 woker 內，都是 `postMessage` 推、 `onmessage` 收。

### Worker Example

```javascript
self.addEventListener('message', (event) => {
  // 主線程推送觸發
  self.postMessage(event.data); // 推送給主線程
  self.close(); // worker 關閉自身釋放資源
});
```

1. 獨立的 js 檔案
2. 有著定義監聽 message 的事件（主線程 `postMessage` 時觸發）
3. 在 Worker 執行緒中， `self` 和 `this` 都代表子執行緒的全域性物件
4. `onmessage` 用法同 `addEventLister(‘message’, …)`
5. `self.close()` 關閉 worker 自身

### 主線程 Example

```javascript
// main.js
var worker = new Worker('worker.js');
// 主線程推 data 給 worker
worker.postMessage('Hello World');

// 主線程接收 worker 推過來的 data
worker.onmessage = function(event) {
  console.log('Received message ' + event.data);
};
// 等同於
worker.addEventListener('message', function(event) {
  // ...
});

// worker 內若有錯誤主線程 onerror 會監聽到
worker.onerror = function(event) {
  // ...
};
// 等同於
worker.addEventListener('error', function(event) {
  // ...
});

// 主線程釋放 worker
worker.terminate();
```

1. 創建 worker 實例
2. 定義推送、接收行為
3. 使用完要關閉以節省系統資源

## Worker 內的限制

1. 同源限制：同 domain
2. DOM 限制（全局對象不同）：無法使用 `document` 、 `window` 、 `parent` 這些對象；但是 Worker 可以使用 `navigator` 和 `location` 對象。
3. 通信聯繫（ `postMessage` 、 `onmessage` ）
4. 腳本限制：不能使用 `alert()` 和 `confirm()` ；可以使用 XMLHttpRequest 做 AJAX 請求。
5. 本機文件限制：無法讀取本地文件，引用腳本需自網路

## Worker 種類

1. 專用線程（Dedicated Worker）：只能一個頁面使用
2. 共享線程（Shared Worker）：多個頁面共享使用

## Create-React-App 使用 web worker

- `npm install react-worker`
- worker 內要使用 ES6 寫法需要 `npm install worker-loader`
- CRA 不 eject 的方法 react-app-rewired
  修改 config-overrides.js

```javascript
const filterWarning = (config) => {
  ...
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: {loader: 'worker-loader'},
  });
  config.output.globalObject = 'this';
  return config;
};
```

### 註：

1. 沒有 config.output.globalObject = 'this' 的話會抓不到 window
2. worker 檔名要 .worker.js 結尾

這次由於工作上有優化下載報表的需求而接觸了 web worker 並嘗試使用，稍作研究並整理了一點筆記紀錄。若有認知錯誤或描述不妥的地方歡迎指正並給予建議 😀  
久違的更新筆記呢 其他躺在 hackmd 的雜亂筆記就 ⋯⋯（遠望  

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vR1LTgeM1uxiFadrOJSG9VwQOF_C4FbnINaLiap4UyL1YXDD5xcZ1MPwfrmKPWfpn4FEWRlU1ZGnUYX/embed" width="720" height="420" />
