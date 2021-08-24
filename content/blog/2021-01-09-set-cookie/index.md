---
title: 'Response Set-Cookie 無效'
path: blog/20210109
tags: [apollo]
date: 2021-01-09
excerpt: 記錄個之前在和同事們弄 Side project 時犯蠢遇到的問題與解決方式。
---

在我們專案裡原本前後端都沒設定的情況下 request 是都可以發成功的（有 response 回來），但會發現 Server response 的 set cookie 沒有在 client 瀏覽器被設成功，但也沒有報錯誤警告（原本 GraphQL Playground 預設也不會 set，要開 setting 改成 `"request.credentials": "include"` 才如預期）
![](https://i.imgur.com/uTZtYUO.png)
於是研究了一下

### [跨來源資源共用（CORS／Cross-Origin Resource Sharing）](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/CORS)

<div class="warning">
在（瀏覽器的）同源政策的規定下，如果是不同源的話，預設情況就會把回傳的 response 擋掉，不把結果傳回到 JavaScript（但注意是已經發到 Server 操作完畢了），以避免被竊取資料
☞ 所以不透過瀏覽器是可以隨意發隨意得到結果的
☞ 就算 Response 結果沒回來，此請求是有效的、已操作完的
</div>

當我們在 JavaScript 中透過 fetch 或 XMLHttpRequest 存取資源時，需要遵守 CORS。瀏覽器在發送請求之前會先發送 **preflight request (預檢請求)**，確認伺服器端設定正確的 `Access-Control-Allow-Methods`、`Access-Control-Allow-Headers` 及 `Access-Control-Allow-Origin` 等 header，才會實際發送請求

（結果一開始前後端什麼都沒設定也沒有遇到 CORS⋯⋯
看到 Apollo Server 可以把 cors 關掉，總之先試再說
[![](https://i.imgur.com/IijK0wR.png)
](https://www.apollographql.com/docs/apollo-server/api/apollo-server/)

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => ({ message: err.message }),
  context,
  cors: false,
});
```

會得到結果
![](https://i.imgur.com/v35Xfqy.png)
看一下 request header 少了一堆東西（原來不能隨便關
![](https://i.imgur.com/KPmEsY9.png)
比對原本什麼都沒設的 request header
![](https://i.imgur.com/OqAktH8.png)

後來在 set cookie 那試加 SameSite
先來提一下：

#### CSRF／Cross Site Request Forgery／One-Click Attack／跨站請求偽造

> 因為瀏覽器的運行機制，只要發送 request 給某個網域，就會把關聯的 cookie 一起帶上去，如果使用者是登入狀態，發到與登入頁同網域的 request 中就會自動包含了他的資訊，就可以任意帶著身份發請求。

- 看起來 CSRF 就是 Cookie 基於瀏覽器機制導致的安全性問題，但是 Chrome 51 版加入了功能：[`SameSite`](https://www.chromestatus.com/feature/4672634709082112)，能在預設擋掉跨域請求的帶 Cookie 行為

#### SameSite

- 為一項在寫入 cookie (Set-Cookie: key=value) 時可加註的屬性 (attribute)
- 分為：
  - Strict：僅限 same-site request 才能夠帶有此 cookie
  - Lax：全部的 same-site request 以及部分 cross-site request 能夠寫入 cookie
    - Chrome 80+ 後所有 Set-Cookie 未預設 SameSite 屬性的預設值
    - 部分包含能送出 request 的網頁元件：
      - `<a>`
      - `<link rel="prerender">`
      - `<form method="GET">`
        <div class="danger">
        Cross-site 登入機制緩衝調整：為了避免上線後大量使用第三方認證與登入機制的網站失效，目前初步上線的行為為 “Lax + POST” 模式。意味著如果是透過跨網域 (cross-site) 登入且使用 POST 發送請求的機制時，未被標示任何 SameSite 屬性的 Cookie 將允許被掛在請求上發送，但時限為兩分鐘。這項機制未來有機會被移除。
        </div>
    - 若需發送第三方 cookie，需加上 `SameSite=None; Secure` 才會生效
      - Secure 指定需透過 Https 發 request
  - None：無論是 same-site 還是 cross-site 的 request 上， 都可以帶有該 cookie
    - Chrome 舊版預設
- 如何應應？針對會成為第三方用途的 cookie 掛上 `SameSite=None; Secure`；而針對只有在自己 domain 下會使用到的 Cookie 加上 `SameSite=Strict` 或 `SameSite=Lax`
- [這邊可以看當前瀏覽器 SameSite 版本規則](https://samesite-sandbox.glitch.me/)，全部為綠色則為已開啟
- 還是得實作 CSRF Token
  > 話說前面根本都試錯方向囧

### 最後解決：再看一次文檔 [Apollo Authentication Cookie](https://www.apollographql.com/docs/react/networking/authentication/#cookie) 照著加設定

> You just need to pass the credentials option. e.g. `credentials: 'same-origin'` as shown below, if your backend server is the same domain or else `credentials: 'include'` if your backend is a different domain.

```javascript
// Client
const link = createUploadLink({
  uri: 'http://localhost:4403',
  credentials: 'include', // local前後端不同port算跨域所以include
});

const client = new ApolloClient({
  connectToDevTools: true,
  cache,
  link,
});
```

只加了 Client 的 credentials: 'include' 設定：
![](https://i.imgur.com/kq8PFI4.png)
因為漏掉 Server 也要加設定

> Note: the backend must also allow credentials from the requested origin. e.g. if using the popular 'cors' package from npm in node.js, the following settings would work in tandem with the above apollo client settings:
> 使用 cookie 的情況下還需額外設定 `Access-Control-Allow-Credentials` header。

加了 credentials: true：
![](https://i.imgur.com/iGKkStj.png)
因為還要設定 origin

```javascript
// Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => ({ message: err.message }),
  context,
  cors: {
    origin: 'http://localhost:9000',
    credentials: true,
  },
});
```

兩邊都設對再試 Cookie 就能設成功了
可以參考 [和 CORS 跟 cookie 打交道](https://medium.com/d-d-mag/%E5%92%8C-cors-%E8%B7%9F-cookie-%E6%89%93%E4%BA%A4%E9%81%93-dd420ccc7399) 大概理解

> cookie 並不能跨域傳遞，也就是說不同 origin 中的 cookie 沒辦法互相傳遞及存取。不過如果你在 a 網域送出了 b 網域的請求，且 b 網域回傳了 cookie 的訊息，那麼在 a 網域會以 b 網域的形式儲存一份 cookie，如果沒有設定 `withCredentials` 或是 `credentials: ‘include’` 的話，就算伺服器有回傳 Set-Cookie，一樣不會被寫入。
>
> 在一般情況下如果再使用 b 網域的 API，cookie 是不會自動被送出去的。這個情況下，你必須在 XHR 設定 withCredentials 或是 fetch 的選項中設置 `{ credentials: 'include' }`，因為這也是一個跨域請求，所以也必須遵照 CORS 要件加入 `Access-Control-Allow-Origin` (Server)
>
> 此外瀏覽器會自動拒絕沒有 `Access-Control-Allow-Credentials` 的回應，也因此如果要能夠將身份訊息傳到跨網域的伺服器當中，必須額外加上 `Access-Control-Allow-Credentials: true`

#### 包含憑證(Credentials) 的 Request 用法（設在 Apollo Client link）

- `include`：讓瀏覽器將 credentials 跟著 request 一起送出
- `same-origin`：讓瀏覽器將 credentials 只發送給同源的 URL
- `omit`：確保瀏覽器不會帶著 credentials 請求

#### 簡單跨網域請求

如果資源應該要限制請求者的網域（domain），或是假如資源需要身分驗證（credentials）來進行存取（或是要設定驗證）。則篩選請求的 Origin 標頭就可能是必要的，或至少呼應請求者的 Origin 標頭值（例如 Access-Control-Allow-Origin: http://localhost:9000）。另外，將會發送 Access-Control-Allow-Credentials: true 標頭

## Reference

- [讓我們來談談 CSRF](https://blog.techbridge.cc/2017/02/25/csrf-introduction/)
- [Chrome 80 後針對第三方 Cookie 的規則調整 (default SameSite=Lax)](https://medium.com/@azure820529/chrome-80-%E5%BE%8C%E9%87%9D%E5%B0%8D%E7%AC%AC%E4%B8%89%E6%96%B9-cookie-%E7%9A%84%E8%A6%8F%E5%89%87%E8%AA%BF%E6%95%B4-default-samesite-lax-aaba0bc785a3)
- [Chrome Cookie 政策調整與反思](https://blog.kalan.dev/2020-04-13-chrome-cookie-%E6%94%BF%E7%AD%96%E8%AA%BF%E6%95%B4%E8%88%87%E5%8F%8D%E6%80%9D/)
- [關於 Cookie 與 CORS 的再思考](https://blog.kalan.dev/2020-10-18-rethink-cookie-and-cors/)
- [和 CORS 跟 cookie 打交道](https://medium.com/d-d-mag/%E5%92%8C-cors-%E8%B7%9F-cookie-%E6%89%93%E4%BA%A4%E9%81%93-dd420ccc7399)
- [【CORS】跨來源資源共用 CORS](https://medium.com/@des75421/cors-%E8%B7%A8%E4%BE%86%E6%BA%90%E8%B3%87%E6%BA%90%E5%85%B1%E7%94%A8cors-191d4bfc4735)
