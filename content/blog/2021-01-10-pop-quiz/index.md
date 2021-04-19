---
title: 'Pop Quiz'
path: blog/20210110
tags: [javascript]
date: 2021-01-10
excerpt: 記錄踩到的陷阱題。
---

某次發現 line 技術群有人 po 這個 [Pop Quiz](https://js-pop-quiz.now.sh/#/)，看一下覺得題目都滿考觀念，當作準備面試題也挺不錯就來做做看

### With which constructor can we successfully extend the Dog class?

```javascript
class Dog {
  constructor(name) {
    this.name = name;
  }
}

class Labrador extends Dog {
  // 1
  constructor(name, size) {
    this.size = size;
  }
  // 2
  constructor(name, size) {
    super(name);
    this.size = size;
  }
  // 3
  constructor(size) {
    super(name);
    this.size = size;
  }
  // 4
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }
}
```

Ans: 2

### What's the output?

```javascript
// index.js
console.log('running index.js');
import { sum } from './sum.js';
console.log(sum(1, 2));

// sum.js
console.log('running sum.js');
export const sum = (a, b) => a + b;
```

With the `import` keyword, all imported modules are pre-parsed. This means that the imported modules get run first, the code in the file which imports the module gets executed after.  
This is a difference between require() in CommonJS and import! With require(), you can load dependencies on demand while the code is being run. If we would have used require instead of import, running index.js, running sum.js, 3 would have been logged to the console.

Ans: running sum.js, running index.js, 3

### What's the output?

```javascript
const name = 'Lydia Hallie';
console.log(name.padStart(13));
console.log(name.padStart(2));
```

With the `padStart` method, we can add padding to the beginning of a string. The value passed to this method is the total length of the string together with the padding. The string "Lydia Hallie" has a length of 12. name.padStart(13) inserts 1 space at the start of the string, because 12 + 1 is 13.  
If the argument passed to the padStart method is smaller than the length of the array, no padding will be added.

Ans: " Lydia Hallie", "Lydia Hallie"

### How can we log the values that are commented out after the console.log statement?

```javascript
function* startGame() {
  const answer = yield 'Do you love JavaScript?';
  if (answer !== 'Yes') {
    return "Oh wow... Guess we're gone here";
  }
  return 'JavaScript loves you back ❤️';
}

const game = startGame();
console.log(/* 1 */); // Do you love JavaScript?
console.log(/* 2 */); // JavaScript loves you back ❤️
```

Ans: game.next().value and game.next("Yes").value

---

有空再繼續新增
