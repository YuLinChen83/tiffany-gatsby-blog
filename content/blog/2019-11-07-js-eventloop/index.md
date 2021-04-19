---
title: 'Javascript Event loop - macro task & micro task'
path: blog/20191107
tags: [javascript]
date: 2019-11-07
excerpt: 介紹 Event loop 容易混淆的異步任務 macro task & micro task。
---

[Hackmd](https://hackmd.io/mU49WAgDSVWvcSB6n8vmmA?view)

![](https://i.imgur.com/PqEj2tf.png)

- JavaScript 是單線程，瀏覽器中主執行緒擁有一個 執行棧（execution context stack／call stack） 以及一個 任務佇列（task queue／callback queue）
- 所有任務可分為同步任務（synchronous）或異步任務（asynchronous）
  - 同步任務都在主線程上執行，形成一個**執行棧 execution context stack**
  - 異步任務指當運行有結果，就在**任務隊列 callback queue** 之中放置一個事件，等待丟到 stack 進入主線程執行
    - 當 stack 中所有同步任務執行完畢，才會讀取 task queue 任務丟進 stack 執行
    - queue 中異步任務還區分成 `macro task` 跟 `micro task` 兩種，在 ECMAScript 中，microtask 微任務又稱為 job，macrotask 就 task
      - **macrotasks**（通常指一般的 task）
        setTimeout, setInterval, setImmediate, I/O, UI rendering
        一次只會入棧一個執行
      - **microtasks**（job）
        process.nextTick, Promises, Object.observe(廢棄), MutationObserver
        會一次入棧並執行完所有 microtasks
      - ps. **在 node 環境下**，process.nextTick 的優先順序高於 Promise
  - 瀏覽器為了能夠使得 JS 內部 task 與 DOM 任務能夠有序的執行，會在一個 task（這邊指 macro task）執行結束後、下一個 task 執行開始前，對頁面進行重新渲染  
     `task → 渲染 → task → ...`  
    白話說明(?)：
    > 1. 遇到同步直接執行
    > 2. 遇到異步的 macro task 丟進 callback queue 再繼續向下執行
    > 3. 遇到異步的 micro task 會丟到特別的 job queue 等同步執行完、該丟的 macro task 丟到 callback queue 後，再回來處理並清空這次 job queue 累積的 micro task
    > 4. job queue 空了再執行剛 2. 丟到 callback queue 的 macro task
    > 5. 頁面渲染
       <div class="warning">
       在每一次事件循環中，只會入棧一個 macrotask 執行，主線程執行完該任務後又會先檢查 microtasks 隊列並完成裡面的所有任務後再執行 macrotask
       → 不斷偵測 call stack 是否為空，如果是空的話就把 callback queue 裡面的東西丟到 call stack
       </div>

### Question 1.

```javascript
console.log('script start');
setTimeout(function() {
  console.log('setTimeout');
}, 0);
Promise.resolve()
  .then(function() {
    console.log('promise1');
  })
  .then(function() {
    console.log('promise2');
  });
console.log('script end');
```

### Question 2.

```javascript
a(function() {
  console.log('a');
});
console.log('hello');
```

不一定，因為沒說 a 是同步還是非同步

```javascript
function a(fn) {
  fn(); // 同步執行 fn
}
```

```javascript
function a(fn) {
  setTimeout(fn, 0); // 非同步執行 fn
}
```

### Question 3.

提示：setInterval、setTimeout 是 macro task；Promise 是 micro task  
想想並先將自己答案記起來，3 分鐘作答～

```javascript
console.log('start');

const interval = setInterval(() => {
  console.log('setInterval');
}, 0);

setTimeout(() => {
  console.log('setTimeout 1');
  Promise.resolve()
    .then(() => {
      console.log('promise 3');
    })
    .then(() => {
      setTimeout(() => {
        console.log('setTimeout 2');
        Promise.resolve()
          .then(() => {
            console.log('promise 4');
          })
          .then(() => {
            clearInterval(interval);
            console.log('clearInterval');
          });
      }, 0);
      Promise.resolve().then(() => {
        console.log('promise 7');
      });
    });
}, 0);

Promise.resolve()
  .then(() => {
    console.log('promise 1');
  })
  .then(() => {
    console.log('promise 2');
  });

console.log('end');
```

### Question 4.

提示：setTimeout 是 macro task；MutationObserver、Promise 是 micro task

1. 在 outer click？
2. 在 inner click？ (event bubbles)

```html
<div class="outer">
  <div class="inner"></div>
</div>
```

```javascript
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

// 監聽 outer element 當 attribute changes 時觸發
new MutationObserver(function() {
  console.log('mutate');
}).observe(outer, {
  attributes: true,
});

function onClick() {
  console.log('click');

  setTimeout(function() {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function() {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```

[看視覺化的流程](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

## References

- [JavaScript 中的同步與非同步（上）：先成為 callback 大師吧！](https://blog.huli.tw/2019/10/04/javascript-async-sync-and-callback/index.html?fbclid=IwAR18LUDiosggPZnp7XaylPGDD2zoyRdd9SnwvlrO4zDgkBpwypBdcKUlXyc)
- [event loop js 事件迴圈 microtask macrotask](https://www.itread01.com/content/1548614167.html)
- [聊聊 JavaScript 非同步中的 macrotask 和 microtask](https://www.jishuwen.com/d/25jF/zh-tw)
- [Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
  - 有簡單的例子還以易懂的視覺化呈現可參考
- [What the heck is the event loop anyway? | Philip Roberts | JSConf EU](https://youtu.be/8aGhZQkoFbQ)
