---
title: 'React Hooks - useCallback, useMemo, useRef'
path: blog/20190906-2
tags: [reactjs]
date: 2019-09-06
excerpt: JavaScript 是單執行緒、單線程的程式語言，所有的程式碼片段都會在堆疊中被執行，Web worker 相當於可讓主線程開其他 thread。
---

[分享 PPT](https://docs.google.com/presentation/d/1qivdPehhqYPGvXRrHvAknW4PDUp_S04Edo7SPwH0nn0/edit?usp=sharing)

## Hooks

- 有狀態的且會造成副作用的函式（和 Functional programming 相反）
- 不寫 React Class component & this 降低 React 門檻
- 可以和 Class component 混用

## 提升性能的 useCallback, useMemo？

1. 調用 setState，就會觸發組件的重新渲染（無論前後的 state 是否不同）
2. 父組件更新，子組件也會自動更新
3. 若 props 為 inline function，每次 render 的時候都會重新生成一個新的函數
   - 不要用 inline function，將 function 預先定義
   - 使用 useCallback 或 useMemo 來保存函數的引用，避免重複生成新的函數

優化效能方向：不要觸發 render function、保持 virtual DOM 的一致
為了改善這種不必要的 re-renders 使用 useCallback／useMemo ：

- 並不是使用就一定效能提升
- 優化通常有代價，採用前要評估是否利大於弊

## 官方定義

- ### [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback)

  ```javascript
  const memoizedCallback = useCallback(() => {
    doSomething(a, b);
  }, [a, b]);
  ```

  - Pass `an inline callback` and an array of dependencies.
  - Returns `a memoized callback`.
  - Optimized child components that rely on reference equality to prevent unnecessary renders (e.g. shouldComponentUpdate).
  - 若父元件常更新導致子元件 re-render，且若為有 function-prop 的子元件，會使得每次 re-render 都重新 execute 該 function。使用 useCallback 當子元件 prop，可以限定只在 dependency 改變時才 excute，其他時候都會取得 cached function。
    - inline functions are slow？Memory and garbage collection
  - [Source code](https://react.jokcy.me/book/hooks/hooks-others.html)

    ```javascript
    export function useCallback<T>(callback: T, inputs: Array<mixed> | void | null): T {
      currentlyRenderingFiber = resolveCurrentlyRenderingFiber();
      workInProgressHook = createWorkInProgressHook(); // 返回包含memoizedState的hook對象

      const nextInputs = inputs !== undefined && inputs !== null ? inputs : [callback]; // 需要保存下來的inputs，用作下次取用的key

      const prevState = workInProgressHook.memoizedState; // 獲取緩存
      if (prevState !== null) {
        const prevInputs = prevState[1];
        if (areHookInputsEqual(nextInputs, prevInputs)) {
          return prevState[0];
        }
      }
      workInProgressHook.memoizedState = [callback, nextInputs]; // 存入memoizedState以便下次對比使用
      return callback;
    }
    ```

- ### [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo)

  ```javascript
  const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
  ```

  - Pass `a “create” function` and an array of dependencies.
  - Returns `a memoized value`.
  - If no array is provided, a new value will be computed on every render.
  - Helps to avoid `expensive calculations` on every render.
  - 如果會造成 side effects 則該使用 useEffect
  - 和同樣為 16.6.3 發布的 `React.memo` 不一樣（後面說明）
  - [Source code](https://react.jokcy.me/book/hooks/hooks-others.html)

    ```javascript
    export function useMemo<T>(nextCreate: () => T, inputs: Array<mixed> | void | null): T {
      currentlyRenderingFiber = resolveCurrentlyRenderingFiber();
      workInProgressHook = createWorkInProgressHook(); // 返回包含memoizedState的hook對象

      const nextInputs = inputs !== undefined && inputs !== null ? inputs : [nextCreate]; // 需要保存下來的inputs，用作下次取用的key

      const prevState = workInProgressHook.memoizedState; // 獲取緩存
      if (prevState !== null) {
        const prevInputs = prevState[1];
        if (areHookInputsEqual(nextInputs, prevInputs)) {
          return prevState[0];
        }
      }

      const nextValue = nextCreate(); // 執行useMemo傳入的第一個參數(函數)
      workInProgressHook.memoizedState = [nextValue, nextInputs]; // 存入memoizedState以便下次對比使用
      return nextValue;
    }
    ```

當 dependencies 改變才會執行，優化子元件避免不必要的 renders

> `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

- ### [useRef](https://reactjs.org/docs/hooks-reference.html#useref)

  ```javascript
  const refContainer = useRef(initialValue);
  ```

  - 常用在訪問子元素的實例
  - 可以接受一個默認值，並返回一個含有 current 屬性的可變對象
  - useRef 會在每次渲染時返回同一個 ref 對象（React.createRef 則是每次創新 ref）
  - useRef 就像是可以在其 .current 屬性中保存一個可變值的盒子，渲染週期之間可共享數據的存儲

    ```javascript
    function App(props) {
      const [count, setCount] = useState(0);
      let it;
      useEffect(() => {
        it = setInterval(() => {
          setCount((count) => count + 1);
        }, 1000);
      }, []);

      useEffect(() => {
        if (count >= 5) {
          clearInterval(it); // 經過多次 render 已不是一開始賦予值的 it
        }
      });

      return (
        <div style={{ padding: '100px' }}>
          <h1>{count}</h1>
        </div>
      );
    }
    ```

    ```javascript
    function App (props) {
      const [count, setCount] = useState(0);
      const it = useRef(null)

      useEffect(() => {
        it.current = setInterval(() => {
          setCount(count => count + 1)
        }, 1000)
      } , [])

      useEffect(() => {
        if (count >= 5) {
          clearInterval(it.current)
        }
      })

      return (
        ...
      )
    }
    ```

  - 可以獲取上次的 props 和 state

    ```javascript
    function Counter() {
      const [count, setCount] = useState(0);
      const prevCount = usePrevious(count);
      return (
        <h1>
          Now: {count}, before: {prevCount}
        </h1>
      );
    }

    function usePrevious(value) {
      const ref = useRef();
      useEffect(() => {
        ref.current = value;
      });
      return ref.current;
    }
    ```

- ### [useImperativeHandle](https://reactjs.org/docs/hooks-reference.html#useimperativehandle)

  ```javascript
  useImperativeHandle(ref, createHandle, [deps]);
  ```

  - 用於自定義暴露給父組件的 ref 屬性
  - 需要配合 forwardRef 一起使用
  - In this example, a parent component that renders `<FancyInput ref={fancyInputRef} />` would be able to call `fancyInputRef.current.focus()`.

    ```javascript
    // 子元件
    function FancyInput(props, ref) {
      const inputRef = useRef();
      useImperativeHandle(ref, () => ({
        focus: () => {
          inputRef.current.focus();
        }
      }));
      return <input ref={inputRef} ... />;
    }
    FancyInput = forwardRef(FancyInput);
    ```

    ```javascript
    // 父组件
    import React, { useRef } from 'react';
    function App() {
      const fancyInputRef = useRef(null);
      // 獲取子元件暴露的方法
      fancyInputRef.current.focus();
      return (
        <div>
          <FancyInput ref={fancyInputRef} />
        </div>
      );
    }
    ```

---

#### 補充：Memoization

- `Memoization` 是 JavaScript 中通過緩存結果並在下一個操作中重新使用緩存來加速查找費時的操作（像建表查表）
  - 以空間換速度
  - Pure function 適用
    - 相同的輸入，必定拿到相同的輸出（沒有任何副作用）
    - 可移植、可測試、可緩存
    - 舉例：javascript 的 slice 是，但 splice 不是
    - Curry、Compose 也是 Pure function 應用
      - Curry（parital application 或 partial evaluation）
        將一個接受 n 個參數的 function，轉變成 n 個只接受一個參數的 function 的過程
        - Partial Function Application
          和 curry 不同的是一個函式可能會接收超過一個以上的參數
      - Compose
        能把多的參數組合在一起，產生一個新的 function
    - Functional Programming（FP）
      - 一種編程範式(programming paradigm)，就像 Object-oriented Programming(OOP)一樣，就是一種寫程式的方法論
      - 把函式當成參數傳入，並以沒有 side effect 的方式回傳另一個函式
      - 都是 表達式 (Expression) 不會是 陳述式(Statement)
      - 可讀性高、可維護性高、易於平行處理
      - rx 的重要觀念
      - 衍伸出 Pure Function、Currying、Higher-Order Function

#### 補充：React.memo

```javascript
const Demo = React.memo(
  ({ children }) => <div>{children}</div>,
  (prevProps, nextProps) => {
    /*
     return true if passing nextProps to render would return
     the same result as passing prevProps to render,
     otherwise return false
    */

    return false;
  }
);
```

- 不是 React.useMemo
- high Order Component
- 可以用 functional component 實現 `shouldComponentUpdate`／`PureComponent`
  - PureComponent：會自動進行 [shallow equal](https://hackmd.io/JZ7CjfG1Sjap68_s00F8CA?view#%E8%A3%9C%E5%85%85%EF%BC%9AShallow-compare) 比對進行 re-render
- functional component 可以使用 `React.memo(Component, areEqual)` 來改寫。`areEqual` 取代 `shouldComponentUpdate`
  - 注意 return 的 boolean 代表意義不同
- 第二個參數可像 shouldComponentUpdate 自定義判斷更新條件，但仍要注意考量函數的性能開銷。如果道具對象過深，反而會消耗不少的性能。

#### 補充：PureComponent

- 每次都會進行 shallow compare ，而 Component 則不會，所以誤用有可能反而效能更差
- 傳入的 props 或 state 不可以有每次都會變動的值，不然其實和 Component 沒兩樣
- 不能使用 shouldComponentUpdate
- 最好作為展示組件

#### 補充：一致性比較：Reconciliation 協調

React 每次 render() 都會做 Diffing 比對根元素、Reconciliation 更新 DOM

```javascript
// 子元素末尾添加一個元素
<ul>
  <li>first</li>
  <li>second</li>
</ul>

<ul>
  <li>first</li>
  <li>second</li>
  <li>third</li>
</ul>
```

```javascript
// 開始處插入一個節點 -> 性能就不佳
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```

所以加 `key` 讓 React 得以比對出哪些是新的該創、舊的該卸載、現有的僅作移動。但不要用 index 當 key：當索引用作 key 時，組件狀態在重新排序時也會有問題。組件實例基於 key 進行更新和重用。如果 key 是索引，則 item 的順序變化會改變 key 值。這將導致受控組件的狀態可能會以意想不到的方式混淆和更新。

#### 補充：Shallow compare

- 採用嚴格相等（Strict Equality Comparison）：
  對於基本型別 (number, string, boolean, null, undefined, symbol)，值必須要完全相等；
  對於物件型別 (object, array, function)，必須指向同一個 reference。
  ![](https://i.imgur.com/18p9agH.png)
- 只比到第一層
- 所以有可能發生：
  1. 值不一樣，但因為 reference 一樣所以回 true 不更新不 render
  2. 值一樣，但因為 reference 不同所以回 false 而更新

#### 補充：父組件獲取子組件數據的 3 種方式 [Example](https://codesandbox.io/embed/focused-star-gwvlo)

1. createRef
2. useRef + forwardRef
3. useImperativeHandle + forwardRef + useRef
