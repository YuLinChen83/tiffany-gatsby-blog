---
title: '淺入淺出 Service Worker'
path: blog/20220206
tags: [javascript]
date: 2022-02-06
excerpt: 簡單紀錄下關於 PWA 與 Service Worker 的觀點與主要功能。
---

話說原來剛畢業工作之餘 survey 的 [web push notification](/blog/20170604) 就是 sw 的應用，雖然忘光了，趁這次的讀書會來了解並記錄一下相關內容，範例的部分之後若有機會使用上再來補充，有誤再請多指教 🙇‍♀️

> 作為開發者，首要任務應該是確保瀏覽器快速獲取顯示交互頁面所需的最低限度的關鍵資源集

# PWA

先來談談什麼是 PWA（Progressive Web Apps），其中代表 progressive enhancement，盡可能讓所有不同裝置（考量到擁有不同行為，如打字、觸控、觸控筆）、狀態的使用者都可以呈現最重要的內容與功能實現。

PWA 透過各種技術及設計的優化來達到應用程式的體驗並保留網頁的優勢，藉此做到最好的使用者體驗，提出觀點如下：

- `Progressive` 基本的瀏覽
- `Responsive` 最佳化顯示
- `Connectivity independent` 不依賴網路連接的瀏覽
- `App-like` 瀏覽快速
- `Fresh` 自動更新網站內容
- `Safe` HTTPS
- `Discoverable` SEO
- `Re-engageable` 例如推播提升用戶回流率
- `Installable` 可以 Add To Home 到桌面不需透過 App Store 下載安裝
- `Linkable` 可以透過 URL 分享

[Build the Next Generation Mobile Web](https://youtu.be/3tb-1MWg44Y)

但並沒普及，很大原因是礙於一些作業系統的限制，例如 [Web App manifest](https://developer.mozilla.org/zh-TW/docs/Web/Manifest)、Launching screen、Installation prompt API、Push notification、Background Sync、In-App Browser 等 PWA 重要的功能 ios 都沒有支援

# Service Worker

## What

- Browser level，運行在不同於 main thread 的 thread 上（worker context），因此執行可以不被畫面的渲染或 block 住，並且在瀏覽器關閉時可以繼續在背景執行，但在不用時會被中止，並在下次有需要時重啟
  - 跟 Web worker 一樣，沒有辦法操作 DOM，且需要依賴 postMessage 來與頁面溝通
  - [What can service workers do that web workers cannot?](https://stackoverflow.com/questions/38632723/what-can-service-workers-do-that-web-workers-cannot)
    || Web Workers | Service Workers |
    |--------------|--------------|------------------|
    | Instances | Many per tab | One for all tabs |
    | Lifespan | Same as tab | Independent |
    | Intended use | Parallelism | Offline support |
  - 如果存在需要持續保存並在重啟後加以重用的信息，Service Worker 可以訪問  [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- 核心功能是做為瀏覽器與 network 之間的 proxy，擁有攔截使用者發出請求的能力（透過監聽 `fetch` 事件），且提供了快取的功能，可以在攔截使用者發出的請求後決定要不要回傳快取的內容
  ![](https://i.imgur.com/cWQ9yUh.png)
  - Web API [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) 是 Request / Response object pairs，存於 browser 實踐的 long lived memory
  - 優先級別高於 HTTP Caching
  - 可以做到支持離線體驗，因此也能節省流量
    - 在 server worker cache 之前，則是以 AppCache 實踐，但問題很多
- 包括如推送通知（Push Notification ）和後台同步等功能

### 補充

- Cache 分為
  - Client Cache - 伺服器與瀏覽器之間的快取機制，如 HTTP Caching（Browser Caching）、Service Worker Caching
  - Server Cache（Application Cache）
  - Networking Cache - 如 CDN caching
- 快取的優先順序（會先到哪種 cache 找有沒有資料）  
  `memory cache -> service worker cache -> disk cache (browser cache)`
  - memory cahce 並不是所有瀏覽器都會實作的一種快取，Chrome 來說是把資源存在 RAM 中，效能比 disk cache 快，但關閉瀏覽器時就會清空
  - 在 build application 時會透過像是 webpack 的 bundler 打包時加 hash 到檔名以免在需要重要檔案時還 disk cache
  - Service Worker Caching 可以搭配 HTTP Caching 一起使用以達到更好的體驗

## Why

- 對快取有更細粒度的控制權，可以應需求實作不同策略
- Cache 實現離線瀏覽功能
- 像 Native App 一樣的推播 [Push Notification](https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications?hl=en) 功能
- [Background Sync](https://developers.google.com/web/updates/2015/12/background-sync) 自動更新 - 網路不好時的請求依然會在接上時發出

## How

- 只支援 HTTPS 或是 localhost 使用
- 透過 sw 監聽的 life circle 事件來控管頁面
  ![](https://developers.google.com/web/fundamentals/primers/service-workers/images/sw-lifecycle.png)
- 原始版 - [离线指南](https://web.dev/offline-cookbook/#serving-suggestions)
- 封裝版 - [Workbox](https://developers.google.com/web/tools/workbox/guides/get-started)

# References & Resources

- [今晚，我想來點 Web 前端效能優化大補帖！ - Day18 X Service Workers Cache](https://ithelp.ithome.com.tw/articles/10276666)
- [30 天 Progressive Web App 學習筆記 - Day 03 - 30 天 Progressive Web App 學習筆記 - 什麼是 PWA?](https://ithelp.ithome.com.tw/articles/10186584)
- [Web Fundamentals - Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Progressive Web App Training](https://www.youtube.com/playlist?list=PLNYkxOF6rcIB2xHBZ7opgc2Mv009X87Hh)
