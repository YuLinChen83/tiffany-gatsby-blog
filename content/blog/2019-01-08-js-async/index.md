---
title: 'JavaScript 認識非同步 Callback, Promise, async/await'
path: blog/20190108
tags: [javascript]
date: 2019-01-08
excerpt: Asynchronous 非同步的不同寫法的整理筆記。
---

由於到目前為止的工作上都沒什麼機會用到，想好好了解一下非同步（Asynchronous）的不同寫法（Callback, Promise, async/await）所以在 Study 後整理個筆記。

## Callback

把 A function 傳進 B function，當 B 做完事後才執行 A。若事件是多個 callback 下來便會淪落那張波動圖 callback 地獄 XD

```javascript
function dynamicDOM(result) {
  // render DOM by result
}

function getUserList(cb) {
  $.ajax(apiUrl, {}).done(cb(result));
}

getUserList(dynamicDOM);
```

```javascript
const renderMembers = (members) => {
  // render DOM by members
};

const fetchMembers = (companyName) => {
  fetch(`${apiUrl}?company=${companyName}`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((result) => {
      cb(result);
    })
    .catch((error) => console.error('Error:', error));
};
fetchMember('Google', renderMembers);
```

## Promise

定義 Promise 傳入 resolve 與 reject 表示資料成功與失敗，透過 then, catch 來回傳結果，方法內執行同時並不會影響其他函式的運行。

```javascript
let runPromise = (someone, timer, success = true) => {
  console.log(`${someone} 跑程式`);
  return new Promise((resolve, reject) => {
    if (success) {
      setTimeout(function() {
        resolve(`${someone} 的程式執行了 ${timer / 1000} 秒時間`);
      }, timer);
    } else {
      reject(`${someone} 的程式無法執行`);
    }
  });
};

runPromise('Tiffany', 3000)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });

console.log('Promise 結束前就會執行這');
```

## Await

承上定義好的 runPromise， Promise 結束前，後面的程式碼都無法被執行，且中間 await 的若是 reject 將不會知道而程式終止在那。

```javascript
let tiffanyRun = await runPromise('Tiffany', 2000);
console.log('執行完成:', tiffanyRun);
let benRun = await runPromise('Ben', 2500);
console.log('執行完成:', benRun);
```

await 也可以和 Promise.all() 共用，一樣若是 reject 將不會知道而程式終止在那；若皆 resolve 會得到 resolve 值的陣列。

```javascript
let allRun = await Promise.all([runPromise('Tiffany', 3000), runPromise('Ben', 2500)]);
console.log(allRun);
```

## Await/Async

用 Async 包裝好後就可以像是用同步程式呼叫它，且 await 的錯誤會讓 async 拋出錯誤（await 錯誤的 rejected），而不會造成終止。
Async 的結構就類似將 await 包在裡面 Promise。Async/Await 使得程式碼更簡潔容易閱讀。

```javascript
const asyncRun = async () => {
  // await Promise 的值為 resolve 的內容
  let tiffanyRun = await runPromise('Tiffany', 2000);
  let benRun = await runPromise('Ben', 2500);
  return `${tiffanyRun}, ${benRun}`;
};
asyncRun()
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

當 async 內皆 resolve，asyncRun 視為 resolve Promise，若 await 中被 reject 則會視為 reject Promise 自動把該 await 的 reject 拋給 async。
async 最後 return 的值為 .then() 所接的值。  
若想在 async/await 內攔截其中某 await Promise 的 reject 並做處理以讓程式繼續可用 try catch。可看 Codepen Example。

## Notes

1. async/await func 通常以目的命名
2. async/await func 定義前面要加上 async ( 變成回傳 Promise )
3. async/await func 內所有回傳 Promise 的非同函數前面都可以加上 await，被加上時就會等到 resolve value 出現程式才會往下走

## References

[鐵人賽：JavaScript Await 與 Async](https://wcc723.github.io/javascript/2017/12/30/javascript-async-await/)
[Day 14 – 二周目 – 從 Promise 昇華到 async/await](https://ithelp.ithome.com.tw/articles/10201420)
