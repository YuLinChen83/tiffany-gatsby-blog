---
title: '常用 NoSQL 雲端資料庫 - Part 1 MongoDB'
path: blog/20200518
tags: [mongodb]
date: 2020-05-18
excerpt: 簡介 Relational/NoSQL database、mongoose ORM 寫 mongo CRUD API。
---

## Relational Database & NoSQL Database

- Relational database：  
  傳統 db 大多都是，資料是以一或多個資料表方式存放，並以 SQL 操作。  
  資料庫正規化非常重要，避免系統儲存空間上的浪費、增加效能，其中最有名的就是第一(1NF)到第三正規化(3NF)
  - [1NF](https://progressbar.tw/posts/265)：定義主鍵值（primary key / unique key）、剔除重複資料
  - [2NF](https://progressbar.tw/posts/267)：拆 Table 透過 primary key 主鍵(PK) / foreign key 外鍵(FK) 關聯 \* [3NF](https://progressbar.tw/posts/270)：每一個非鍵值欄位都不得與其他非鍵值欄位具相關性
- NoSQL（Not Only SQL）：  
  對不同於傳統的關聯式資料庫的資料庫管理系統的統稱。  
  適合行動、Web、遊戲等需要彈性、可擴展性、高效能和高功能資料庫的新型應用程式。
  - [看看 AWS 的 NoSQL 解說](https://aws.amazon.com/tw/nosql/)
  - 由於 NoSQL 的種類很多，而技術的成熟度與使用場景不一，目前業界還是以 SQL 資料庫佔大多數 (SQL：Structured Query Language)
- ![](https://i.imgur.com/eIqC7x5.png) <br><br>

  | Tranditional                     | NoSQL-文件資料模型(MongoDB)為例              |
  | -------------------------------- | -------------------------------------------- |
  | Table                            | Collection                                   |
  | Row                              | Document                                     |
  | Column                           | Field                                        |
  | 資料可預測且高度結構化的         | 資料動態且經常變更的                         |
  | 需要撰寫安全性                   | 需要快速寫入和寫入安全性並不重要             |
  | 可以使用複雜的查詢和報表         | 資料抓取很簡單                               |
  | Queries 需要 join table 較耗時   | Queries 較高效                               |
  | 使用者更集中                     | 資料需要寬地理分佈                           |
  | 應用程式將會部署到大型的高階硬體 | 應用程式將會部署至商用硬體，例如使用公用雲端 |

- 2019 stackoverflow 統計
  [![](https://i.imgur.com/JGWfO5A.png)](https://insights.stackoverflow.com/survey/2019#technology-_-databases)
  Top SQL Database Alternatives for 2020:  
  ![](https://i.imgur.com/7Nvc5Nd.png)  
  Top NoSQL Database Alternatives for 2020:  
  ![](https://i.imgur.com/qIJhdVb.png)
- OMD / ORM 使可以不用資料庫管理系統的原生語言對資料庫資料進行操作，依不同的資料庫類型，分別使用不同的映射技術，讓開發者可以使用物件導向語法來操作資料庫，增加程式碼的易讀性與維護性（但也有開發者們認為直接用原生語言（如 SQL）才能確保操作時的效率與準確）
  - 文件資料庫：ODM (Object Document Mapper) ex. Mongoose for Mongo
  - 關聯式資料庫：ORM (Object Relational Mapping) ex. LINQ to SQL

---

## Firebase vs MongoDB

前端能快速上手的後端 api 串接相關可能會想到 [JSON Server](https://tpu.thinkpower.com.tw/tpu/articleDetails/1327)、Firebase、MongoDB...  
這邊想做個 Firebase 和 MongoDB 的比較

### Firebase

Firebase 是 Google 的 realtime app platform，提供完整的 solution 供適合需要及時性、跨裝置、離線支持的應用快速構建  
Firebase 與 Google Cloud Platform (GCP) 共用三款產品：[Cloud Firestore](https://firebase.google.com/products/firestore?hl=zh-cn)、Cloud Functions、Cloud Storage，通過 Firebase 向開發者開放

[Firebase vs Google Cloud Platform (GCP)](https://firebase.google.com/firebase-and-gcp?hl=zh-cn)

### MongoDB

MongoDB Inc 開源的 NoSQL document database，依 query 需求提供彈性和可擴展性

![](https://i.imgur.com/YySgrSt.png)

### References

[Firebase Vs MongoDB : Battle Of The Best Databases For 2020](https://www.excellentwebworld.com/mongodb-vs-firebase/) - 有很多比較很詳盡

---

### [MongoDB](https://docs.mongodb.com/guides/)

- Node.js 通常搭配 MongoDB 使用，[Mongoose](https://mongoosejs.com/docs/) 提供了非常方便的介面操作 mongoDB (ODM)，而且 MongoDB 有提供免費的雲端資料庫服務 MongoDB Atlas
  - [17 Media](https://www.inside.com.tw/article/17763-MongoDB) 資料也是運行在 MongoDB Atlas
- MongoDB 特性：
  - Document based: field-value pair data structures
  - Scalable
  - Flexible: No document schema required
  - Performant
  - Free and open source
- 下載 [MongoDB Compass](https://www.mongodb.com/products/compass): The GUI for MongoDB
- 註冊 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=google&utm_campaign=gs_apac_taiwan_search_brand_atlas_desktop&utm_term=mongodb&utm_medium=cpc_paid_search&utm_ad=e&gclid=CjwKCAjwwMn1BRAUEiwAZ_jnEiTCp46TXTdSXzZdp3AvymAShg1KRANkrJCuQTqVhQyXmZ-G_DzZ6RoCTkQQAvD_BwE): Cloud-hosted MongoDB service on AWS, Azure and Google Cloud
- mongoDB 在建立每個文件的時候會預設建立 \_id 屬性作為文件的唯一標識

### 建制/啟動本地 MongoDB（先略過有興趣再自己看）

[Download MongoDB](https://www.mongodb.com/download-center/community)

- 將下載包 bin 底下 cp 到 `/usr/local/bin` 下，在 `/usr/local/bin`
  - `sudo mkdir /data/db`
  - `sudo chown -R`id -un`/data/db`
  - `mongod` 啟動 mongo db server
  - 啟動後再開個 terminal tab
    `mongo` 進入後就可直接操作資料了；`quit()` 則跳出。以下一點較常用的方法/例子
    - `use XXX` 切換/建 db
    - `db.XXX.insertOne({...})` 在 XXXcolection 中插入一筆
    - `db.XXX.insertMany([{...},{...},...])` 在 XXXcolection 中插入一筆
    - `db.XXX.find()` 檢視 collection 下資料
    - `db.XXX.find({key: value/operator})` 檢視 collection 下符合條件資料
      - `db.tours.find({rating: 4.7})`
      - `db.tours.find({price: {$lte: 300}})`
      - `db.tours.find({price: {$lt: 300}, rating: {$gte: 4.7}})`
      - `db.tours.find({$or: [{price: {$lt: 300}}, {rating: {$gte: 4.7}}]})`
    - `db.tours.updateOne({"name":"The Sea Hiker"}, {$set: {"price": 999}})`
    - `db.tours.updateMany({price: {$lt: 300}, rating: {$gte: 4.7}}, {$set: {premius: true}})`
    - `db.tours.deleteMany([])`
    - `show dbs` 看所有 db
    - `show collections` 看該 db 下的所有 collections
    - `quit()`

### 今日小練習：用 Mongoose 寫 CRUD API

- MongoDB GUI（可跳過）：使用 MongoDB Compass 連至雲端 MongoDB Atlas 的 Cluster
  1. MongoDB Atlas 上創建 free Cluster
     並 在 Network Access 加入當前 IP 至白名單、Database Access 添加使用者（記好 password，等等還要設在 env 變數）  
     Cluster → Overview → connect → 複製修改 connection string  
     `mongodb+srv://tiffany:<password>@cluster0-tetlw.mongodb.net/test`  
     就可以使用 GUI 連看了  
     ![](https://i.imgur.com/Pmx8P6P.png)  
     ![](https://i.imgur.com/H1wgawX.png)  
     ![](https://i.imgur.com/zpqN5pn.png)
- [Express](https://expressjs.com/zh-tw/)：快速、集思廣益、極簡的 Node.js Web 架構
- [Mongoose](https://mongoosejs.com/docs/) 是給 MongoDB, Node.js 的 ODM（Object Data Modeling）套件，可以讓我們更方便處理 CRUD

#### 直接開啟專案吧

> 寫個 user 的 restful api
> 先 clone 專案 https://github.com/YuLinChen83/node-mongoose-practice

1. 在 atlas 上創建 backstage DB 和 空的 users collection  
   ![](https://i.imgur.com/9mtS9s6.png)  
   並複製連線字串，例：  
   `DATABASE=mongodb+srv://tiffany:<password>@cluster0-tetlw.mongodb.net/test?retryWrites=true&w=majority`  
   回到專案創 `config.env` 設置參數  
   注意：`test` 要改成 db name、`<password>` 要被 `DATABASE_PASSWORD` 取代 (`DATABASE_PASSWORD=剛剛記的使用者密碼`)
   - `config.env`
     ```
     NODE_ENV=development
     PORT=3000
     DATABASE=mongodb+srv://tiffany:<PASSWORD>@cluster0-tetlw.mongodb.net/backstage?retryWrites=true&w=majority
     DATABASE_LOCAL=mongodb://localhost:27017/backstage
     DATABASE_PASSWORD=P1IpkV56tAMcaOpO
     ```
   - `server.js` connect db
     ```javascript
     const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
     mongoose
       .connect(DB, {
         useUnifiedTopology: true,
         useNewUrlParser: true,
       })
       .then(() => console.log('DB connection successful!'))
       .catch((err) => {
         console.log(`DB connection error: ${err.message}`);
       });
     ```
2. 定義 api route  
   → 專案 steps branch 的 step1 commit

   - RESTful API 是符合 REST (Representational State Transfer) 風格的 API 撰寫方式  
     ⌑ Uniform interface  
     ⌑ Stateless  
     ⌑ Client-server  
     ⌑ Cachable  
     ⌑ Layered System  
     ⌑ Code on demand (Optional)
   - 使用 HTTP Method
     ⌑ POST：新增  
     ⌑ GET：讀取  
     ⌑ PUT：修改（修改整份文件）  
     ⌑ PATCH：修改（修改其中幾個欄位）  
     ⌑ DELETE：刪除  
     可以先 start 啟動並請求 API 看看

     ```javascript
     import express from 'express';

     const app = express();
     app
       .route('/api/users')
       .get(getAllUsers)
       .post(createUser);

     app
       .route('/api/users/:id')
       .get(getUser)
       .patch(updateUser)
       .delete(deleteUser);

     export default app;
     ```

3. refactor structure、定義 userSchema 新增 Model  
   → 專案 steps branch 的 step2 commit  
   ⌑ `/models` 創建 Model，在這邊定義 Schema 後 export 實例  
   ⌑ `/controllers` 依據資料定義對 Model 做資料操作的方法  
   ⌑ `/routes` 定義 restful api 對應 controller 內的方法

   - Schema [Validation](https://mongoosejs.com/docs/validation.html)，定義 document [資料型別](https://mongoosejs.com/docs/schematypes.html)
     - 內建 validators
       - required
       - min, max (for Numbers)
       - enum, match, minlength, maxlength (for Strings)
     - unique 不是 validator，但在這邊用來限制 field 值不重複
   - 創建 model 並 export
     A model is a class with which we construct documents.

     ```javascript
     import { Schema, model } from 'mongoose';

     const userSchema = new Schema({
       account: {
         type: String,
         unique: true,
         required: true,
       },
       password: {
         type: String,
         required: true,
       },
       name: {
         type: String,
         required: true,
       },
       age: Number,
       description: String,
       birthday: Date,
       createdAt: {
         type: Date,
         default: Date.now(),
         select: false,
       },
     });

     const User = model('User', userSchema);

     export default User;
     ```

4. Controller CRUD
   → 專案 steps branch step3 commit 之後
   速覽 [Mongoose Queries](https://mongoosejs.com/docs/queries.html)，兩種執行法：第二參數 callback function 或作為 promise 使用  
   ⌑ `Model.deleteMany()`  
   ⌑ `Model.deleteOne()`  
   ⌑ `Model.find()`  
   ⌑ `Model.findById()`  
   ⌑ [`Model.findByIdAndDelete()`](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove)  
   ⌑ `Model.findByIdAndRemove()`  
   ⌑ [`Model.findByIdAndUpdate()`](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate)  
   ⌑ `Model.findOne()`  
   ⌑ `Model.findOneAndDelete()`  
   ⌑ `Model.findOneAndRemove()`  
   ⌑ `Model.findOneAndReplace()`  
   ⌑ `Model.findOneAndUpdate()`  
   ⌑ `Model.replaceOne()`  
   ⌑ `Model.updateMany()`  
   ⌑ `Model.updateOne()`

想深入了解可詳閱 [mongodb document](https://docs.mongodb.com/manual/introduction/)

- MongoDB 還有很方便產分析數據的 [aggregation 用法](https://docs.mongodb.com/manual/reference/operator/aggregation/)，提供眾多 operator 可以實現複雜的分群分析，Mongoose 也能使用
- Mongoose 提供四種 middleware，document、query、aggregate、model
- Swagger 是一個工具讓你的 API 可以更視覺化被呈現

下集待續(?)

Firebase, Redis, Elasticsearch... etc.
