---
title: 'Web 常見攻擊手法'
path: blog/20180521
tags: [security]
date: 2018-05-21
excerpt: 擁有基本的資安觀念保護好自家資料和 user 使用環境是開發人員重要的一點。
---

擁有基本的資安觀念保護好自家資料和 user 使用環境是開發人員重要的一點。這邊針對常見的攻擊手法與防範方式複習個並簡單做筆記，如有講述不正確還請不吝指正與交流。

## SQL Injection
未驗證的參數直接代到 SQL 指定對資料庫做非預期行為，使資料庫資料被任意存取或修改刪除。  
> 外部參數在代入 SQL 陳述式前驗證格式（例 Regular Expression）或檢查／取代特殊符號，最好也設存取權限。

## XSS (Cross-Site Scripting) 跨網站指令碼攻擊
只要有 run javascript 的網站（用戶端可以執行 script 時），就有可能被修改 script 倒置網頁被埋入惡意程式做些壞事情，如竊取資料、監控、掌握後門等。可以分為反射式（Reflected）、儲存式（Stored）。
> 白名單政策／黑名單、不要將不信任的資源放上 Web  
例前陣子第三方套件被嵌了門羅幣網頁挖礦導致開有引用js網頁的該瀏覽器現成幫人挖礦的挖礦機。

## CSRF / XSRF (Cross Site Request Forgery) 跨站請求偽造
和 XSS 是不同東西，CSRF 指在不同的 domain 底下卻能夠偽造出「使用者本人發出的 request」。瀏覽器發送 request 給某個網域就會把關聯的 cookie 一起帶上去，所以滿容易實現。
> 加上圖形驗證碼、簡訊驗證碼、Google 的 SameSite、Double Submit Cookie 等等。
> Double Submit Cookie 利用攻擊者的沒辦法讀寫目標網站的 cookie，所以 request 的 csrf token 會跟 cookie 內的不一樣」

## DDoS (Distributed Denial of Service Attack)
駭客短時間內傳送大量網路封包，堵塞網站的流量使網站將無法再工作而停止服務。

## Phishing 釣魚
是一種企圖從電子通訊中，透過偽裝成信譽卓著的法人媒體以獲得目標資訊。

## Clickjacking (Click hijacking) 點擊劫持
例駭客製造假按鈕或透明按鈕讓使用者不知情點擊並將資料發送給駭客。