---
title: 'IntersectionObserver'
path: blog/20210109-2
tags: [javascript]
date: 2021-01-09
excerpt: 公司專案有個日期連動的 scroll 優化試驗，原先是監聽 scroll。
---

IntersectionObserver API 提供一種可以異步監聽目標元素與根元素視口 viewport 交叉狀態的手段  
→ 讓你知道哪時觀察的目標元素進入或離開 viewport  
→ 可以觀察一個目標元素是否在 viewport 內  
→ 自動觀察元素是否可見，像商店的歡迎光臨自動門  
![](https://i.imgur.com/C50gpNY.png =400x)

<div class="warning">
傳統實現方法是：監聽 scroll 事件，調用目標元素 getBoundingClientRect() 方法得到它對應於 viewport 左上角的坐標，再判斷是否在 viewport 內。
缺點是由於 scroll 事件密集發生，計算量很大，容易造成性能問題。
</div>

## 建立 IntersectionObserver

1. 建立觀察器（observer）
   ```javascript
   const observer = new IntersectionObserver(callback, [option]); // 瀏覽器原生提供的構造函數
   ```
   - `callback`：當目標可見性變化時的回調函數
   - `option`：觀察器配置項（optional），default 如下
     ```javascript
     {
       root: null,
       rootMargin: "0px 0px 0px 0px",
       threshold: [0],
       // V2 新增：
       delay: 0,
       trackVisibility: false,
     }
     ```
     **參數說明**
     - `root`：
       DOM element，指定目標元素所在的容器節點（即根元素）。null 時指的是 window，表示可被觀察的區域 viewport。當目標物進入或離開 root 時會觸發 callback。目標元素必須在 root 元素內。
     - `rootMargin`：
       跟 CSS 一樣上右下左順序，定義根元素的 margin，用來擴展或縮小 rootBounds 矩形的大小，從而影響 intersectionRect 交叉區域的大小。
       ![](https://i.imgur.com/tR6F4EH.png)
     - `threshold`：
       目標與 viewport 的交叉比例，單值或 Array，0~1 值，決定什麼時候觸發回調函數。
       [看 `threshold: [0, 0.25, 0.5, 0.75, 1]` 圖例](https://developers.google.com/web/updates/images/2016/04/intersectionobserver/threshold.gif)，代表當綠色方塊出現了 0%、25%、50%、75%、100% 這些範圍後，都會執行一次 callback
     - `delay`：
       指定監測到目標元素變更後延遲多久才觸發回調函數
     - `trackVisibility`：
       表示是否需要監測目標元素在可視區是否可見
2. 指定觀察器 observer 要觀察的目標 element（可以觀察多個）
   ```javascript
   observer.observe(element); // 不用再觀察時記得 unobserve 取消
   // observer.observe(element2)
   // observer.observe(element3)
   ```
   停止觀察目標
   ```javascript
   observer.unobserve(element);
   ```
   停止觀察器
   ```javascript
   observer.disconnect();
   ```
3. `callback` 函數的參數 entries 是 IntersectionObserverEntry Array，如果同時有兩個被觀察的對象的可見性發生變化，entries 數組就會有兩個成員
   `IntersectionObserverEntry` 提供目標元素的信息
   ```javascript
   let callback = (entries, observer) => {
     entries.forEach((entry) => {
       // Each entry describes an intersection change for one observed
       // target element:
       //   entry.boundingClientRect    目標元素的矩形區域的信息
       //   entry.intersectionRatio    目標元素的可見比例 [註1]
       //   entry.intersectionRect    目標元素與 viewport 的交叉區域的信息
       //   entry.isIntersecting    目標元素當前是否可見（boolean）
       //   entry.rootBounds    根元素的矩形區域的信息，getBoundingClientRect()方法的返回值
       //   entry.target    被觀察的目標 DOM 對象
       //   entry.time    可見性發生變化的時間（ms）
       //   entry.isVisible V2 提供的新屬性，目標元素在可視區是否可見（有無被其他元素遮擋）（boolean）
     });
   };
   ```
   - 註 1. `intersectionRatio`：0~1 值，即 intersectionRect 佔 boundingClientRect 的比例，完全可見時為 1，完全不可見時等於 0
     ![](https://i.imgur.com/jCoCIYB.png =400x)  
     [參考很視覺化的範例，React custom hook useIntersect 寫法](https://codesandbox.io/s/04vvrxj79p)  
     ![](https://i.imgur.com/OuSJJk2.png)  
     ![](https://i.imgur.com/f0ns8Zy.png)

<div class="warning">
注意：

1. 不用繼續觀察的對象記得取消觀察
2. Callback 在 main thread 執行，當中的操作應該要盡可能的輕量快速，若是耗時操作請自行參考[Window.requestIdleCallback()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

- 規格寫明 IntersectionObserver 的實現，應該採用 requestIdleCallback()，即只有線程空閒下來，才會執行觀察器。這個觀察器的優先級非常低，只在其他任務執行完，瀏覽器有了空閒才會執行。
</div>

## 常見使用情境

- Lazy load
- 無限滾動
- 當元素出現在／離開可視範圍內動畫
- 側邊欄固定
- 計算廣告在頁面上曝光的次數、時間
  - 自行參考 [Timing element visibility with the Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API/Timing_element_visibility)
  - https://letswritetw.github.io/letswrite-intersection-observer/

## Can I Use

[![](https://i.imgur.com/9uQG3uR.jpg)](https://caniuse.com/mdn-api_intersectionobserver)
支援度在 IE 直接 GG，視支援度需求記得加 [polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill#browser-support)

## References

- [MDN Web docs - Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API/Timing_element_visibility)
- [阮一峰 - IntersectionObserver API 使用教程](http://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html)
- [Surma - IntersectionObserver’s Coming into View](https://developers.google.com/web/updates/2016/04/intersectionobserver) (2016/4)
- [Eric Bidelman - An event for CSS position:sticky](https://developers.google.com/web/updates/2017/09/sticky-headers) (2017/9)
- [How To Use an IntersectionObserver in a React Hook](https://medium.com/the-non-traditional-developer/how-to-use-an-intersectionobserver-in-a-react-hook-9fb061ac6cb5) 假設只觀察一個 node 可看
- [Augustus - IntersectionObserver：下篇-實際應用
  lazyload、進場效果、無限捲動](https://letswritetw.github.io/letswrite-intersection-observer/)
