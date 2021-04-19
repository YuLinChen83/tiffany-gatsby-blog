---
title: 'JavaScript 中 this 指向'
path: blog/20180514
tags: [javascript]
date: 2018-05-14
excerpt: 簡介 this 指向的六種情況。
---

因本人對於 this 的用法還沒有很熟悉，特此再找些資源複習個並做個筆記，也方便之後自己混淆了可以查找，若有錯誤或不當解說還請不吝指教。

this 指向的六種情況（取決於函數是如何執行的）

## 一、this 指向*調用*該函示的物件

```javascript
Object.functionName(); //函式內的 this 指向此物件
```

## 二、this 指向全域物件

若直接調用函式前方沒有物件（非物件.函式()），則函式內 this 指向全域物件，例如瀏覽器會指向 window 物件。若為 es6 中嚴格模式下（”use strict”），this 被規定不指全域而是 undefined。  
※ 延伸：容易混淆的借用函式範例

```javascript
var x = 10;
var obj = {
  x: 20,
  f: function() {
    console.log(this.x);
  },
};

obj.f(); // this 指向 obj, x = 20
var fOut = obj.f;
fOut(); // 函式前無 obj, this 指向全域, x = 10
var obj2 = {
  x: 30,
  f: obj.f,
};
obj2.f(); // obj2 調用函式 f , this 指向 obj2, x = 30
```

## 三、利用 bind(), call() 或 apply() 將 this 改變所指物件

`bind` 可代入想直接替換成 this 的所指物件。（可在匿名函式宣告的花括號結尾處 `.bind(obj)`）  
`call` 與 `apply` 都是呼叫該函式並讓該函式的 this 指向第一個物件參數，差在其後的參數為攤平給（call）還是陣列給（apply）。  
※ bind 是複製原本的函式，並且將你所指定的 this 代入這個函式中；而 call 和 apply 則是將你所指定的 this 直接代入該 function 中並執行。

## 四、this 指向 new 所產生之新物件

若將函式當作建構式來用，則內部的 this 則指向於 new 所產生之新物件。  
但要注意若建構式回傳的是 object 對象，則 new 操作後返回的是此對象而不是 this。

```javascript
var MyClass = function() {
  this.name = 'Lin';
  return {
    name: 'Yu Lin',
  };
};
var obj = new MyClass();
console.log(obj.name); // Yu Lin
```

## 五、callback 函式內的 this 指向於調用放入該 callback 的函式的 this 所指物件

待補充說明。

## 六、ES6 箭頭函數當中的 this 是*定義*時的對象，非使用時的對象

箭頭函式中的 this 定義時所在的對象，且固定不改變。  
※ 一般不建議在對象物間中用箭頭函式定義函數

---

## 複習：

1. 無參數或多參數時要括號，單一參數可省略括號
2. 若只是回傳單一值一般會省略 return
3. javascript 遵循詞法作用域（Lexical Scope），若無定義會向上查找
4. Arrow Function 本身沒有 this，所以會遵循詞法作用域向上查找

## 參考文章

- [Javascript：this 用法整理](https://software.intel.com/zh-cn/blogs/2013/10/09/javascript-this)
- [[筆記] JavaScript ES6 中的箭頭函數（arrow function）及對 this 的影響](https://pjchender.blogspot.tw/2017/01/es6-arrow-function.html) <br><br>

在還不熟悉 this 所指時又遇上了 ES6，真的滿混淆的 XD  
不過果然還是要實際各用法都寫過才會有比較深刻的印象，之後也許會再自己寫些練習或範例來補充個。
