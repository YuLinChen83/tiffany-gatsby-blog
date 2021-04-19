---
title: 'REST / RESTful & HTTP Methods'
path: blog/20210109-3
tags: [javascript]
date: 2021-01-09
excerpt: 簡易整理。
---

RESTful API 是一種設計風格，這種風格使 API 設計具有整體一致性，易於維護、擴展，並且充份利用 HTTP 協定的特點。  
當有符合以下的方法去定義 API 時，可以將它稱作 Restful API。

> REST: Resource Representational State Transfer

- 常見的 HTTP 請求服務的 Methods：

  - GET 取得
  - POST 新增
  - PUT 替換資源
  - PATCH 替換資源部分內容
  - DELETE 刪除
  - HEAD 類似 GET，但只回傳 HTTP header
  - OPTIONS 回傳該資源所支援的所有 HTTP 請求方法
  - CONNECT 將連線請求轉換至 TCP/IP 隧道

> PUT/PATCH 都可以修改，差別 PUT 傳的會整個替換掉原本的，PATCH 則會部分修改。

```json
// 假設原始，要將 doors 改為 5
{
 "front_patio": true,
 "back_patio": true,
 "windows": 12,
 "doors": 4,
 "Balcony": false
}
// PUT 更新
{
 "front_patio": true,
 "back_patio": true,
 "windows": 12,
 "doors": 5,
 "Balcony": false
}
// PATCH 更新
{
 "doors": 5
}
```

| Verb   | SAFE | IDEMPOTENT | Cacheable | 動作     | 語意                                                                       |
| ------ | ---- | ---------- | --------- | -------- | -------------------------------------------------------------------------- |
| GET    | O    | O          | O         | 讀取     | 請求所需要的資源。                                                         |
| HEAD   | O    | O          | O         | 讀取     | 與 GET 相同，但伺服器只傳輸 HTML 的狀態與表頭。                            |
| POST   | X    | X          | O         | 新增     | 在請求中攜帶負載，並執行特定資源的處理。                                   |
| PATCH  | X    | X          | X         | 部分更新 | 請求更新一筆資源的部分內容，必須是存在的資源。                             |
| PUT    | X    | O          | X         | 完整更新 | 請求更新一筆資源的所有內容，必須是存在的資源，資源傳遞必須完整，否則為空。 |
| DELETE | X    | O          | x         | 刪除     | 請求移除資源。                                                             |

SAFE 代表的含意為「是否安全」，所謂的安全便是「在請求的過程中，是否有任何資源的改動(新增、修改、移除)  
Idempotent Methods 冪等方法 代表這筆請求就算重複操作，也會產生相同的結果。換句話說，如果在網路狀態不佳的環境，就算重複執行也不會有問題。

- URI 由 prefix(例如 /api 或 /api/v1) + API endpoint 組成。API endpoint 的設計，幾個重要原則如下

  - 一般資源用複數名詞
  - 唯一資源（亦即對 client 而言只有一份的資源）用單數名詞
  - 資源的層級架構，可以適當反應在 API endpoint 設計上（路由語義化）  
    強調從路由結構就能看出要對什麼資料、進行什麼操作。

- API 回傳的結果給適當的 HTTP 狀態碼（可參考 [Wiki: List of HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)）

## References

- [簡明 RESTful API 設計要點](https://tw.twincl.com/programming/*641y)
- [HTTP Request Method 設計行為與分析](https://hackmd.io/@ETC/S1NH8feOW/https%3A%2F%2Fhackmd.io%2Fc%2FSk9Q5VoV4%2Fhttps%253A%252F%252Fhackmd.io%252FsaHgyr0MToW7jyQi4d0FBA)
