---
title: '常用 NoSQL 雲端資料庫 - Part 2 Firebase'
path: blog/20200527
tags: [firebase]
date: 2020-05-27
excerpt: 簡介 Google 提供的後端服務平臺（BaaS）中的兩種 DB，realtime database 和 cloud firestore。
---

[HackMD](https://hackmd.io/@Z4tcvPvzQ5OeHajRP1rAiQ/S1Z1GPqiI/https%3A%2F%2Fhackmd.io%2F%40Z4tcvPvzQ5OeHajRP1rAiQ%2Fr1-4VmriL)

# [Firebase](https://firebase.google.com/docs/web/setup)

Firebase 是為行動應用開發者所提供的後端服務平臺（Backend as a Services，BaaS）  
可以讓前端人員在雲端快速建置後端服務，專注在前端

> Firebase 在 2014 年被納入 Google 旗下，主力支援開發、分析功能

<div class="alert-info">
BaaS 提供的最常見的服務包括推送通知、文件存儲和共享、與社交網絡（如Facebook和Twitter）的集成、位置服務、資料庫持久性和查詢、消息傳遞和聊天功能、用戶管理、運行業務邏輯和使用分析工具...etc.
</div>
![](https://i.imgur.com/hYTMmmT.png)  
Firebase 新增完專案進入可看到目錄開發的部分如上
* Authentication 身份驗證
* Database 資料庫
* Storage 儲存：圖片影片等 media assets
* Hosting 託管：靜態網站部署功能
* Functions 開發和管理 server side 功能
* ML Kit 機器學習相關服務

> 此次重點為 firebase 的 database，不過還是會提到一點點常用的服務

[先前往 firebase console 新增專案並創 Web application 吧](https://firebase.google.com/) 🐱  
![](https://i.imgur.com/L69ION0.png)

- `npm i firebase`
  create firebase utils js

  ```javascript
  import firebase from 'firebase/app';
  import 'firebase/auth';
  import 'firebase/database';
  import 'firebase/storage';

  // config 可以在專案總覽>專案設定下找到
  const config = {
    apiKey: '...',
    authDomain: 'vuechatroom-b8368.firebaseapp.com',
    databaseURL: 'https://vuechatroom-b8368.firebaseio.com',
    projectId: 'vuechatroom-b8368',
    storageBucket: 'vuechatroom-b8368.appspot.com',
    messagingSenderId: '908937200350',
    appId: '1:908937200350:web:83c3b9b2fb2e664f85784f',
  };
  firebase.initializeApp(config);

  // 看要用到什麼功能 export 實例
  // export const auth = firebase.auth();
  // export const db = firebase.database();
  // export const firestore = firebase.firestore();
  // export const storage = firebase.storage();
  ```

## Database

- 分成 Cloud Firestore 和 Realtime Database 兩種 realtime updated NoSQL db
- [Choose a Database: Cloud Firestore or Realtime Database](https://firebase.google.com/docs/database/rtdb-vs-firestore)

  - 兩者皆
    1. 不需部署、維護 server
    2. Realtime updates
    3. [免費配額](https://firebase.google.com/pricing)
  - 可同時使用，但整體資料架構不同，且**資料不互通**
  - 簡易比較

    | Realtime database                                              | Cloud firestore                                                  |
    | -------------------------------------------------------------- | ---------------------------------------------------------------- |
    | baisc queries (filter, sort 不能同時)                          | advanced queries (filter, sort 可以同時)                         |
    | basic write/transaction operations                             | advanced write/transaction operations                            |
    | queries are deep by default                                    | queries are shallow                                              |
    | simple json tree                                               | collections                                                      |
    | queries do not require an index                                | queries are indexed by default                                   |
    | query performance is proportional to the size of your data set | query performance is proportional to the size of your result set |
    | hard scale (and need sharding)                                 | easy scale (automatic)                                           |
    | presence                                                       | x                                                                |

- firebase 沒有 model，但也可以實作一個像 mongodb ORM mongoose 的 Model 功能
- 都是先選定 reference 位置再操作上面的值

## Realtime Database

- 透過 JSON tree [資料格式](https://firebase.google.com/docs/database/web/structure-data)儲存並即時同步到所連線的用戶端，JSON 應避免巢狀、盡量扁平化
- 如果在網路離線時操作會立即寫進 local version database，當再次連上（無關閉視窗）即會同步到 remote database 和其他用戶端
- 建立 db 時以測試模式啟動的預設[規則](https://firebase.google.com/docs/rules)先暫時改為 read, write 皆為 true 後續認證完才有辦法存取
  ![](https://i.imgur.com/BbQlyTg.png)
- [CRUD](https://firebase.google.com/docs/database/web/read-and-write)

  - Reference: `firebase.database().ref('.../...')`
  - Create
    - `set()` 在任何 reference 位置儲存/複寫資料
      ```javascript
      const writeUserData = (userId, name, email, imageUrl) => {
        db.ref('users/' + userId).set({
          username: name,
          email: email,
          profile_picture: imageUrl,
        });
      };
      ```
    - `push()` 自動產生一個節點（新 reference）並添加儲存資料
      ```javascript
      const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          await db.ref('chats').push({
            content: state.content,
            timestamp: Date.now(),
            uid: state.user.uid,
          });
          // ...
        } catch (error) {
          // handle error
        }
      };
      ```
  - [Read](https://firebase.google.com/docs/database/web/read-and-write#listen_for_value_events)
    - `on()` or `once()` 讀取 reference 上的資料並監聽改動獲取 snapshot
      需要 `snapshot.val()` 取得資料 🔆
      建議 ref 不要太 root 避免 snapshot 太大包
      - `on()`
        ```javascript
        const starCountRef = db.ref('posts/' + postId + '/starCount');
        starCountRef.on('value', (snapshot) => {
          updateStarCount(postElement, snapshot.val());
        });
        ```
        `off()` 可移除該 reference 上的監聽，但不包含 child 的監聽
      - `once()` 只讀取一次，可初始化用
        ```javascript
        const userId = auth.currentUser.uid;
        return db
          .ref('/users/' + userId)
          .once('value')
          .then(function(snapshot) {
            const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
            // ...
          });
        ```
  - Update

    - [`update()`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#update)
      更新部分欄位

      ```javascript
      const adaNameRef = db.ref('users/ada/name');
      // only changed first, last
      adaNameRef.update({ first: 'Ada', last: 'Lovelace' });
      ```

      可同時更新多 reference 的 JSON tree（全更新成功不然就全失敗）

      ```javascript
      const writeNewPost = (uid, username, picture, title, body) => {
        const postData = {
          author: username,
          uid: uid,
          body: body,
          title: title,
          starCount: 0,
          authorPic: picture,
        };

        // 1. Get a key for a new Post.
        const newPostKey = db
          .ref()
          .child('posts')
          .push().key;

        // 2. expect simultaneously updated in the posts list and the user's post list.
        const updates = {};
        updates['/posts/' + newPostKey] = postData;
        updates['/user-posts/' + uid + '/' + newPostKey] = postData;

        return db.ref().update(updates);
      };
      ```

    - [`transaction()`](https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction) 確保更新已存在值時不會因同時操作而衝突
      如果 transaction 中還未 update 完成就又被 set，transaction 會被 set 中斷取消
      ```javascript
      // Try to create a user for ada, but only if the user id 'ada' isn't
      // already taken
      const adaRef = firebase.database().ref('users/ada');
      adaRef.transaction(
        function(currentData) {
          if (currentData === null) {
            return { name: { first: 'Ada', last: 'Lovelace' } };
          } else {
            console.log('User ada already exists.');
            return; // Abort the transaction.
          }
        },
        function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          } else if (!committed) {
            console.log('We aborted the transaction (because ada already exists).');
          } else {
            console.log('User ada added!');
          }
          console.log("Ada's data: ", snapshot.val());
        }
      );
      ```

  - Delete
    - call `remove()` on a reference to the location of that data; `set()` or `update()` to null
  - `set()`, `update()` 第二參數為 optional completion callback
    ```javascript
      db.ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture : imageUrl
      }, (error) => {
        if (error) {
          // The write failed...
        } else {
          // Data saved successfully!
        }
      });
    }
    ```

- ![](https://i.imgur.com/h2xiser.png)
  🔖 [Github chatroom example](https://github.com/YuLinChen83/firebase-chatroom.git)

## Cloud Firestore

- 已經在 2019 年 1 月 31 日脫離 beta 成為 firebase 正式產品，也是官方較推薦的 database
- ![](https://i.imgur.com/9PIRABv.png)
  Root 為多個 Collection，每個 Collection 可裝載多個 Document，每個 Document 實體中也可包含 Collection
- 在集合中創建第一個文檔之後，集合才會存在；如果刪除集合中的所有文檔，集合將不再存在
- [Get started with Cloud Firestore](https://firebase.google.com/docs/firestore/quickstart)
- firestore 建 DB、調權限
  ![](https://i.imgur.com/k2EGE1J.jpg)
  ![](https://i.imgur.com/2G3rVHC.png)
  ![](https://i.imgur.com/ijeCQC8.png)
  測試模式的 default 為 30 日後不得讀寫，可在規則改寫權限
- Data Types
  ![](https://i.imgur.com/aSujnpH.png)

  - array 的值不能有 array
  - [reference](https://stackoverflow.com/a/47673346) 可指定到任何 Document Reference
    Example
    Set a reference on a collection

    ```javascript
    let data = {
      name: 'productName',
      size: 'medium',
      userRef: db.doc('users/' + firebase.auth().currentUser.uid),
    };
    db.collection('products').add(data);
    ```

    Get a collection (products) and all references on each document (user details):

    ```javascript
    db.collection('products')
      .get()
      .then((res) => {
        vm.mainListItems = [];
        res.forEach((doc) => {
          let newItem = doc.data();
          newItem.id = doc.id;
          if (newItem.userRef) {
            newItem.userRef
              .get()
              .then((res) => {
                newItem.userData = res.data();
                vm.mainListItems.push(newItem);
              })
              .catch((err) => console.error(err));
          } else {
            vm.mainListItems.push(newItem);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });
    ```

  - 完整的 types 和其 default sort 這邊看 [document](https://firebase.google.com/docs/firestore/manage-data/data-types#data_types)
  - firestore 用 indexes 確保 queries 的高效，index 分為 single-field and composite
    - single-field 為 document 預設建立每個欄位升序和降序的兩個 index（非所有型別的資料欄位像是 map, array）可以高效查詢、排序
      - 查詢 ex. `usersRef.where("born", "<", 1950)`
      - 但 array 可以用 `array_contains` 來查詢 array 有無包含某值 `usersRef.where("tags", "array_contains", "abc")`

- QueryReference
  - return two types of objects: (document or collection) references and snapshots.
    ```javascript
    const collectionRef = firestore.collection('collections');
    collectionRef.onSnapshot(async (snapshot) => {
      const collectionsMap = convertCollectionsSnapshotToMap(snapshot);
      updateCollections(collectionsMap);
    });
    ```
    `firestore.doc('users/:userId')`
    doc 沒指定的話會指向新位置自動產生 document id
    `firestore.collection('/users')`
- get current reference in firebase database
  - documentRef: return documentSnapshot object:
    `set()`, `update()`, `delete()`, `get()`
    - 得到的 snapshot 得知 document 有無存在、id 和一些資訊
      - `.exist` return boolean
      - `.data()` return JSON object of the document 🔆
        ![](https://i.imgur.com/20j0i4h.png)
  - collectionRef: return querySnapshot object
    `add()`, `get()`
    - 得到的 snapshot 得知 collection 有無 document、底下的 documentsSnapshots、長度
      - `.docs`
      - `.empty`
      - `.size`
        ![](https://i.imgur.com/fbkkEwd.png)
- CRUD
  - Create
    - `set()` 在任何 reference 位置儲存/複寫
      可以 merge 儲存（第二參數代設定）資料，和 update() 一樣部分更新
      ```javascript
      const bookRef = firestore.doc('books/1');
      bookRef.set({ price: 300 }, { merge: true });
      ```
      只指定 collection 不指定 doc 的話添加自動生成 id 的 document
      ```javascript
      const bookRef = firestore.collection('books').doc();
      bookRef.set({ title: '離開時,以我喜歡的樣子', price: 500 });
      ```
    - `add()` 在指定 collection 下添加一筆自動生成 id 的 document
      ```javascript
      const bookRef = firestore.collection('books');
      bookRef.add({ title: '我還是會繼續釀梅子酒', price: 500 });
      ```
  - Read
    可以用 `where()`, `orderBy()` 等篩選或排序
    - `get()`
      - 一次性讀取 collection 中的 documents，用 forEach snapShot 取出個別內容（`.data()` 取得 JSON object）
        ```javascript
        const bookRef = firestore.collection('books');
        bookRef.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.id, doc.data());
          });
        });
        ```
      - 一次性讀取 document
        ```javascript
        const bookRef = firestore.collection('books').doc('aifdBTTUf0czEl1EgCG2');
        bookRef.get().then((doc) => {
          console.log(doc.data());
        });
        ```
    - `onSnapshot()` 初始讀取並監聽變化
      - 監聽 collection
        ```javascript
        const bookRef = firestore.collection('books');
        bookRef.onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.id, doc.data());
          });
        });
        ```
      - 監聽 document
        ```javascript
        const bookRef = firestore.collection('books').doc('aifdBTTUf0czEl1EgCG2');
        bookRef.onSnapshot((doc) => {
          console.log(doc.data());
        });
        ```
    - 搭配 [Query](https://firebase.google.com/docs/reference/js/firebase.firestore.Query#where)
      - 可以用鏈式方式透過 `.where()`, `orderBy()`, `limit()`...等 methods 一次 query 排序或篩選結果資料，用在 ref 後、get/onSnapshot 前
        - `where(欄位, 邏輯運算子, 參數值)`
          要注意的是要將等式運算符（==）與範圍運算符（<、<=、>、>=）或 array-contains 子句結合使用，要創建複合索引
          - 只能對單欄位執行範圍比較（<、<=、>、>=），== 則不限制
          - 一個複合查詢中最多只能包含一個 array_contains
          ```javascript
          const bookRef = firestore.collection('books');
          bookRef
            .where('price', '>=', 300)
            .where('price', '<', 400)
            .onSnapshot((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                console.log(doc.id, doc.data());
              });
            });
          ```
        - 利用 `orderBy(欄位, 'desc'或'asc')`, `limit(n筆)` 取排序後的前幾個 documents
          ```javascript
          const bookRef = firestore.collection('books');
          bookRef
            .orderBy('star', 'desc')
            .limit(3)
            .onSnapshot((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                console.log(doc.id, doc.data());
              });
            });
          ```
      - 如果連用時 console 出現 requires an index，可以直接點擊網址自動建立
        ![](https://i.imgur.com/qJljQE0.png)
      - 沒有 `!=` 運算符，得拆成 `>` 和 `<` 實現
      - 如果要實現 OR 查詢，無現成方式。得為每個 OR 條件創建一個單獨的查詢，並在應用中合併查詢結果
  - Update
    - `update()` 指定文件更新部分欄位值
      ```javascript
      const bookRef = firestore.doc(`books/1`);
      bookRef.update({ price: 333 });
      ```
  - Delete
    - `delete()` 刪除集合或文件
      ```javascript
      const bookRef = firestore.collection('books').doc('1');
      bookRef.delete();
      ```
    - 用 `update()` 刪除文件裡的某欄位
      ```javascript
      const bookRef = firestore.collection('books').doc('aifdBTTUf0czEl1EgCG2');
      bookRef.update({ title: firebase.firestore.FieldValue.delete() });
      ```
- `batch()` 可以一次 request 多個 call

  ```javascript
  const addCollectionsAndDocuments = async (collectionKey, objectsToAdd) => {
    const collectionRef = firestore.collection(collectionKey);

    const batch = firestore.batch();
    objectsToAdd.forEach((obj) => {
      const newDocRef = collectionRef.doc();
      batch.set(newDocRef, obj);
    });
    return await batch.commit();
  };
  ```

- ![](https://i.imgur.com/c3XcMhO.png)
  🔖 [Github shop example](https://github.com/YuLinChen83/shop.git)
  🔖 [Github vue-blog example](https://github.com/YuLinChen83/vue-blog.git)

### 心得(?)

firebase 是個很自動化的 server 服務，提供多元化又不需要自己實踐那些功能的邏輯，得以專注在前端開發，方便快速

---

## 補充

## Authentication

可以直接透過 firebase 做多種第三方認證登入，登入狀態持續到 `auth.signOut()`

> 不用保管帳密、不需要自己刻 OAuth 的協定，降低複雜度 👍

![](https://i.imgur.com/0OBVRxz.png)

- 開啟 Email/Password 認證
  圖解 & 說明
  ![](https://i.imgur.com/Qfs21YZ.png)

  ```javascript
  // 註冊
  try {
    const { user } = await auth.createUserWithEmailAndPassword(email, password);
    // ...
  } catch (error) {
    console.error(error);
  }

  // 登入
  await auth.signInWithEmailAndPassword(email, password);
  ```

- 開啟 google 認證
  圖解 & 說明
  ![](https://i.imgur.com/ytIO1No.png)
  ```javascript
  export const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
  };
  ```
- 開啟 [github 認證](https://firebase.google.com/docs/auth/web/github-auth)（[要先去註冊](https://github.com/settings/applications/new)）
  圖解 & 說明
  ![](https://i.imgur.com/cU4kVdH.png)
  ![](https://i.imgur.com/BSPjQLj.png)
  ```javascript
  export const signInWithGitHub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    return auth.signInWithPopup(provider);
  };
  ```
- 開啟 [Facebook 認證](https://firebase.google.com/docs/auth/web/facebook-login)（[要先去註冊](https://developers.facebook.com/apps/)）
  圖解 & 說明
  ![](https://i.imgur.com/BRZy0Hm.png)
  ![](https://i.imgur.com/x4YLRFo.png)
  ![](https://i.imgur.com/HcKtzad.png)
  但實際試了不行，發現應該是我還沒個人驗證的部分 ⋯⋯ 可能得等些時候再驗證完試試
  ![](https://i.imgur.com/fnEW92I.png)

- `firebase.auth().onAuthStateChanged`
  ```javascript
  auth.onAuthStateChanged((userAuth) => {
    if (userAuth) {
      // set authenticated true
      // userAuth 比較常用應該就 displayName, email, uid
    } else {
      // set authenticated false
    }
  });
  ```

## Storage

創建預設是需登入才有權限上傳
![](https://i.imgur.com/tsBqv5V.png)
創建完一樣可以在 Rules 先把 `allow read, write: if request.auth != null;` 改為 `allow read, write: if true;`

### Upload

- `put(檔案)` 上傳
  `on(process callback, fail callback, success callback)` 監聽上傳的變動
  ```javascript
  // firebase.js
  export const storage = firebase.storage();
  ```
  ```
  <input type="file" id="uploadBtn" onChange={handleUpload} />
  {imageAsUrl.imgUrl ? <img src={imageAsUrl.imgUrl} alt="upload" /> : null}
  ```
  ```javascript
  const handleUpload = (event) => {
    const imageAsFile = event.target.files[0];
    const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile);
    uploadTask.on(
      'state_changed',
      (snapShot) => {
        //takes a snap shot of the process as it is happening
        console.log(snapShot);
        let uploadValue = (snapShot.bytesTransferred / snapShot.totalBytes) * 100;
        console.log(uploadValue);
      },
      (err) => {
        //catches the errors
        console.log(err);
      },
      () => {
        // gets the functions from storage refences the image storage in firebase by the children
        // gets the download url then sets the image from firebase as the value for the imgUrl key:
        storage
          .ref('images')
          .child(imageAsFile.name)
          .getDownloadURL()
          .then((fireBaseUrl) => {
            setImageAsUrl((prevObject) => ({ ...prevObject, imgUrl: fireBaseUrl }));
          });
      }
    );
  };
  ```
  不用特地創建資料夾，會自動依據 ref 路徑創建

## Hosting

[靜態網站部署](https://firebase.google.com/docs/hosting/quickstart)
![](https://i.imgur.com/pFWVeoW.png)

- 先 build 出靜態網站
- `curl -sL https://firebase.tools | bash` 安裝 cli
- 沒有登入過的話 `firebase login`（google 帳號）
- `mkdir firebase`
  `cd firebase`
  `firebase init`
  把 build 一整包 cp 到 firebase 下
  `firebase.json` 的 public 改為 build
  `firebase serve`
  `firebase deploy`
  ![](https://i.imgur.com/QMJX73c.png)
  可以看到發版版號、人、時間，還可以迅速復原
  https://vuechatroom-b8368.web.app/

## References

- [Firebase Cloud Firestore 及 Realtime Database 介紹及比較](https://blog.gcp.expert/compare-firebase-cloud-firestore-with-realtime-database/)
- [Building a Real-Time Chat App with React and Firebase](https://css-tricks.com/building-a-real-time-chat-app-with-react-and-firebase/)
- [How to do image upload with firebase in react](https://dev.to/itnext/how-to-do-image-upload-with-firebase-in-react-cpj)
