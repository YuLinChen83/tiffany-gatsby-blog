---
title: '初探 RxJS（下）'
path: blog/20191125
tags: [rxjs]
date: 2019-11-25
excerpt: 簡介上次未完的 RxJS 剩餘角色，和介紹目前公司後台專案使用的 redux-observable。
---

[Hackmd](https://hackmd.io/fa3lKD0ZTPSuxuD-HbigBQ?view)

- 上回分享 - [初探 RxJS（上）HackMD](https://hackmd.io/nG5GoMzKQWiIKc8l00dOjQ?both)
- [RxJS API 文件](https://rxjs-dev.firebaseapp.com/api) - 可搭配[學習 RxJS 操作符](https://rxjs-cn.github.io/learn-rxjs-operators/)，另外也推直接看 [RxJS 快速入門](https://kknews.cc/zh-tw/other/yzzqgvg.html)了解常用的 Operators
- [Operator Decision Tree](https://rxjs.dev/operator-decision-tree) - 用選擇題尋找適合需求的 Operator
- [RxJS Marbles](https://rxmarbles.com/) - 看具體化的異步事件<br><br>

還記得 RxJS 擁有的角色嗎？

- Observable 可觀察對象
- Observer 觀察者
- Subscription 訂閱
- Operators 操作符
- Subject 主體
- Schedulers 調度器<br><br>

> 上次簡單介紹了前三個，回憶一下：
>
> - Observable = stream/資料流/流 = 多了時間維度的陣列，一連串資料事件為其元素
> - 當可被觀察的東西（Observable）有事情發生，觀察者（Observer）就可以做出反應
> - Observable 被 subscribe 時才執行 → 訂閱一個 Observable 就像是執行一個 function
> - 調用 Observable 時返回的 Subscription 訂閱對象有 `unsubscribe()` 方法可以清理由 Subscription 所佔用的資源
> - RxJS 的根基是 Observable，最有用的是它的操作符（Operator），允許複雜的異步程式以聲明式的方式輕鬆組合的基礎單元
>   Operator 是無副作用的純函數，它基於當前的 Observable 創建一個新的 Observable，輸入 Observable（創建操作符不一定）、輸出 Observable（必定）

### Pipeable

先更新上次 LINQ 風格的鍊型寫法，我們捨棄 Observable.operator(...).operator(...)... 的寫法，改為 RxJS 5.5 後建議的 Pipeable 寫法

- Why?
  - patching prototype 造成很多問題
    - global
    - not tree-shakeable
      - 無法像 webpack 移除 JavaScript 上下文中的未引用代码(dead-code)
  - 創建自定義操作符也變得簡單
  - Compilers 和 linters 提供更多幫助

```javascript
// an operator chain, RxJS 舊的鍊型寫法
source
  .map((x) => x + x)
  .mergeMap((n) =>
    of(n + 1, n + 2)
      .filter((x) => x % 1 == 0)
      .scan((acc, x) => acc + x, 0)
  )
  .catch((err) => of('error found'))
  .subscribe(printResult);

// 改 pipe flow, 用 pipe 包操作符
source
  .pipe(
    map((x) => x + x),
    mergeMap((n) =>
      of(n + 1, n + 2).pipe(
        filter((x) => x % 1 == 0),
        scan((acc, x) => acc + x, 0)
      )
    ),
    catchError((err) => of('error found'))
  )
  .subscribe(printResult);
```

- 注意
  - 此改動有些為了不能和 JavaScript 的關鍵字衝突，所以名稱有部分變動
  - 如果是 5 升 6 可以添加 `rxjs-compat` package 使能保持 v5 代碼運行的同時逐漸遷移
  - 盡量直接導入所需的 Observable 創建操作符創建 Observable

#### 自定義 Operator

> Operator 是返回 Observable 的**純函數**

- 基本上

  ```javascript
  const customOperator = <T>() => (source: Observable<T>) => new Observable<T>((subscriber) => {
      return source.subscribe({
        next(value) { subscriber.next(value); },
        error(err) { subscriber.error(err); },
        complete() { subscriber.complete(); },
     });
    });
  });

  source$.pipe(
    customOperator(),
  )
  ```

- 範例：創建一個接受計算 callback function 的 calculate operator

  ```javascript
  const calculate = (fn) => (source) =>
    source.pipe(
      map((value) => fn(value)),
      catchError((err) => of(err))
    );

  of(5, 2, 'hello')
    .pipe(calculate((value) => Math.pow(value, 2)))
    .subscribe(console.log);
  ```

- 想想看：創建一個 toUpperCase Operator
  - 須考慮若接收不是字串會 error
  - 用到的 Operator ?
  - [CodeSandBox](https://codesandbox.io/s/rxjs-painting-example-3msgj?fontsize=14)
- 自定義 Operator 需注意：
  若返回值依賴於在自定義運算符中存儲的狀態會遇問題，最好避免，舉例：

  1. Operator 行為不同

     ```javascript
     import { pipe, range } from 'rxjs';
     import { map, tap, share } from 'rxjs/operators';

     const custom = () => {
       let state = 0;
       return pipe(
         map((next) => state * next),
         tap((_) => (state += 1)),
         share()
       );
     };

     const op = custom();
     console.log('first use:');
     range(1, 2)
       .pipe(op)
       .subscribe((n) => console.log(n));
     console.log('second use:');
     range(1, 2)
       .pipe(op)
       .subscribe((n) => console.log(n));
     ```

     - [`share()`](https://rxjs-cn.github.io/learn-rxjs-operators/operators/multicasting/share.html) 使能在多個訂閱者間共享 observable
       共享的話多次被訂閱只會執行一次 side effect
       share 就像是使用了 Subject 和 refCount 的 multicast（後面介紹）

  2. 不同的訂閱將在其下一個通知中接收不同的值（操作符內的狀態是共享的）

### 來寫寫看吧ヽ(✿ ﾟ ▽ ﾟ)ノ

1. 在 canvas 上畫畫
   - [CodeSandBox](https://codesandbox.io/s/rxjs-playground-ok7mz?fontsize=14)
   - 現有環境下 在 `index.js`
     以 mousemove 行為創建 observable 出發，用提示的 `skipUntil, takeUntil` Operators 來組合看看
     ```javascript
     const paints$ = move$
       .pipe
       // 以 mousemove 行為創建 observable 作為出發寫寫看
       ();
     ```
     加上 `repeat`（缺點
   - 以 mousedown 行為創建 observable 出發，用提示的 `takeUntil, mergeMap` Operators 來組合看看
     `javascript= const paints$ = down$.pipe( // 以 mousedown 行為創建 observable 作為出發寫寫看 );`
     > RxJS has so many ways to get the same answer

#### Subject

允許將值**多播**給多個觀察者，將任意 Observable 執行共享給多個觀察者的唯一方式

- 與 Observable 的不同：
  - 普通的 Observables 是單播的，每個已訂閱的觀察者都擁有 Observable 的獨立執行
  - 在 Subject subscribe 不會調用發送值的新執行，而是將給定的觀察者註冊到觀察者列表中，像 addListener 那樣
- 是一個 Observer，同時也是一個 Observable

  - Observable：Subject 可以被訂閱

  ```javascript
  var subject = new Rx.Subject();

  subject.subscribe({
    next: (v) => console.log('observerA: ' + v),
  });
  subject.subscribe({
    next: (v) => console.log('observerB: ' + v),
  });

  // 透過 next 推送值給所有訂閱者
  subject.next(1);
  subject.next(2);

  // observerA: 1
  // observerB: 1
  // observerA: 2
  // observerB: 2
  ```

  - Observer：Subject 可以傳給 Observable 做訂閱
    ps. 觀察者無法判斷 Observable 執行是來自普通的 Observable 還是 Subject

  ```javascript
  var subject = new Rx.Subject();

  // 註冊到觀察者列表中
  subject.subscribe({
    next: (v) => console.log('observerA: ' + v),
  });
  subject.subscribe({
    next: (v) => console.log('observerB: ' + v),
  });

  var observable = Rx.Observable.from([1, 2, 3]);

  observable.subscribe(subject);

  // observerA: 1
  // observerB: 1
  // observerA: 2
  // observerB: 2
  // observerA: 3
  // observerB: 3
  ```

- 還有一些特殊類型的 Subject 變體：BehaviorSubject、ReplaySubject、AsyncSubject
  _ [BehaviorSubject](https://jsbin.com/xizatojawe/1/edit?js,console)(initialCurrentValue)
  有當前值，當有新的 Observer 訂閱時，會立即接收到 BehaviorSubject 推送的當前值
  _ [ReplaySubject](https://jsbin.com/lukodifere/1/edit?js,console)(bufferCount, windowTime/ms)
  記錄 Observable 執行中的多個值並將其回放推送給新訂閱者，可選擇性給限定內時間 \* [AsyncSubject()](https://jsbin.com/mopalabilo/1/edit?js,console)
  當 Observable 執行完成時`complete()`，將執行的最後一個值發送給觀察者
  <div class="warning">
  單播的 Observable 只會發送值給單個 Observer；若想做到多播，可以將多個訂閱者（Observer）加到 Subject，通過 Subject 發送通知以達到
  → 使得多個觀察者可以看見同一個Observable 執行
  → 這也是 multicast 操作符底層的工作原理
  </div>

#### Operator `multicast(subject)`

```javascript
var source = Rx.Observable.from([1, 2, 3]);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);

// multicast 返回的 ConnectableObservable 是有 connect() 方法的 Observable
// subscribe 跟 subject 一樣是加訂閱清單但不執行
multicasted.subscribe({
  next: (v) => console.log('observerA: ' + v),
});
multicasted.subscribe({
  next: (v) => console.log('observerB: ' + v),
});

// connect() 決定執行時機，返回的是 Subscription Connect
multicasted.connect();
```

情境：[jsbin
](https://jsbin.com/mifumopeji/1/edit?js,console) → 以 `connect()` 顯示調用開啟共享的執行

1. 第一個觀察者訂閱了多播 Observable
2. 多播 Observable 已連接
3. next 值 0 發送給第一個觀察者
4. 第二個觀察者訂閱了多播 Observable
5. next 值 1 發送給第一個觀察者
6. next 值 1 發送給第二個觀察者
7. 第一個觀察者取消了多播 Observable 的訂閱
8. next 值 2 發送給第二個觀察者
9. 第二個觀察者取消了多播 O bservable 的訂閱
10. 多播 Observable 的連接已中斷(底層進行的操作是取消訂閱)

以上情境可以用 ConnectableObservable 的 `refCount()` 自動化實現：當有第一個訂閱者訂閱時，多播 Observable 會自動啟動執行，並當最後一個訂閱者退訂時，自動停止執行 [jsbin](https://jsbin.com/wijeyovano/1/edit?js,console)

#### [Scheduler](https://rxjs-dev.firebaseapp.com/guide/scheduler)

- 忘記 Event loop 的可以 [HackMD](https://hackmd.io/mU49WAgDSVWvcSB6n8vmmA) 回憶
- Observable 可以同時處理同步和非同步行為，也因此容易搞不清處現在的 observable 執行方式是同步還是非同步、什麼時候開始發送元素，而 Scheduler 可以處理這問題
- Scheduler 控制一個 Observable 的訂閱什麼時候開始，以及發送元素什麼時候送達
- 扮演三角色
  1. 是一種資料結構，知道如何根據優先級或其他標準來儲存並佇列任務
  2. 是一個執行環境，決定任務何時何地被執行，可以立即、在 callback 中、在 setTimeout 中、在 animation frame 中執行
  3. 是一個虛擬時鐘，透過`now()`提供了時間的概念，讓任務在特定的時間點被執行
- Observable 使用的 Operator，各自都帶有預設不同的 Scheduler，例如無限的 Observable 預設 `queue`；timer 相關的預設 `async`
- RxJS 5 當中有提供四個 Scheduler (queue, asap, async, animationFrame)
  - `queue`
    - 和預設立即執行差在當使用到遞迴 Operator 時，會是佇列這些行為而非立即執行
    - 適合用在會有遞回的 operator 且具有大量資料時使用，能避免不必要的效能損耗
    - 對應到 event loop 的 `Sync queue`
  - `asap`
    - 是非同步的執行，在瀏覽器其實就是 setTimeout 設為 0 秒 (在 NodeJS 中是用 process.nextTick)
    - 對應到 event loop 的 `Micro Task`
  - `async`
    - 它跟 asap 很像但是使用 setInterval 來運作，通常是跟時間相關的 operator 才會用到（RxJS 5 新增的）
    - 對應到 event loop 的 `Macro Task`
  - `animationFrame`
    - 利用 Window.requestAnimationFrame 來實作的
- 利用 `observeOn` 和 `subscribeOn` 指定每次發送值的時機、訂閱時機

範例

- Rx.Observable.from([1,2,3,4,5]).[`observeOn(Rx.Scheduler.async)`](https://jsbin.com/gewazatepo/edit?js,console)
  可讓原本是同步執行的 Observable 就變成了非同步執行
- 除了 `observeOn()` 以外，Creation Operators 如 `from`, `of`, `merge`, `concat`, `timer`, `interval`... 的最後一位參數都可以接受 Scheduler
- 有無設 delay 的行為模式有差 - [CodeSandBox](https://codesandbox.io/s/rxjs-playground-ci6z5?fontsize=14)

---

### redux-observable

- 前端 react 所用的 `redux-observable` 是 Netflix 開源的用 RxJS 來處理非同步行為的方式
- 導入 redux-observable 的 react redux 專案中的所有 action 都會通過 middleware，可以在 middleware 裡加上多個 Epic（dispatch action 時觸發），每一個 Epic（action stream）就是一個 Observable，可以監聽指定的 action 做轉換處理，並確保最後回傳的是 action 就會被送到 reducer。
  > Epic: actions in, actions out function

![](https://i.imgur.com/421jYIJ.png)

React Redux 導入 redux-observable

- redux-observable 提供 `ofType` operator 來篩選 action stream 中特定的 action
- 先提一下 `fromPromise` 和 `defer` Operator
  - `fromPromise` 接受 Promise 轉為 Observable，接受 Promise 時就會執行該 Promise。若想要當 Promise 被消費時才執行就需要使用 `defer`
  - `defer` 是**惰性**創建操作符
    ![](https://i.imgur.com/fDgDZZL.png)
    接收創建 Observable 的函數，當消費方需要 Observable 時被調用才會創建一個 Observable，並從中取得數據操作（defer 定義當下還不存在 Observable）
- 將 Epic 掛進 store 的 middleware 中，這樣 dispatch action 時就會觸發 Epic 事件
  [Setting Up The Middleware](https://redux-observable.js.org/docs/basics/SettingUpTheMiddleware.html)

  ```javascript
  // 1. 需要用 redux-observable 創建 middleware
  import { combineEpics, createEpicMiddleware } from 'redux-observable';
  const epicMiddleware = createEpicMiddleware();

  // 2. 這個 epicMiddleware 可以吃多個 Epic 的集合
  const rootEpic = combineEpics(可以是很多個Epic的argument);

  // 3. 然後在 redux create Store 時採用此 epicMiddleware
  const store = createStore(rootReducer, applyMiddleware(epicMiddleware));
  // 4.
  epicMiddleware.run(rootEpic);

  export default store;
  ```

## Notes

1. componentWillUnmount 時記得要 unsubscribe Observables 避免 memory lock
2. 若多個 Observer 要訂閱同一 Observable 可以利用 Subject
3. Subject 既是 Observable 也是 Observer
4. 有可以調整執行條件的 Scheduler 存在

## References

- [RxJS Guide](https://rxjs-dev.firebaseapp.com/guide/overview)
- [教程| RxJS 中文文档](https://cn.rx.js.org/manual/overview.html#h14)
- [Redux Observable RxJS: Going Epic with Reactive Programming](https://www.robinwieruch.de/redux-observable-rxjs)
- [[RxJS] Scheduler](https://blog.kevinyang.net/2018/08/31/rxjs-scheduler/)
- [【Day 22】redux-observable](https://ithelp.ithome.com.tw/articles/10225565?sc=rss.iron)
- [Epics · redux-observable](https://redux-observable.js.org/docs/basics/Epics.html)
- [[S05E06] RxJS 運算子全面解析](https://www.youtube.com/watch?v=DPyZq74V60o&list=PL9LUW6O9WZqgUMHwDsKQf3prtqVvjGZ6S&index=17)
- [Mouse Drag with RxJS](https://medium.com/@jdjuan/mouse-drag-with-rxjs-45861c4d0b7e)
