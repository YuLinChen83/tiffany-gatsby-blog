---
title: '204. Move Zeroes'
path: algorithm/204
tags: [leetcode, easy]
date: 2021-08-28
---

[LeetCode Link](https://leetcode.com/problems/count-primes/)

Count the number of prime numbers less than a non-negative number, `n`.

```javascript
/**
 * @param {number} n
 * @return {number}
 */
var countPrimes = function(n) {
  const notPrimes = new Uint8Array(n);
  let count = 0;
  for (let i = 2; i < n; i++) {
    if (notPrimes[i] === 0) count++;
    for (let j = i * i; j < n; j += i) {
      notPrimes[j] = 1;
    }
  }
  return count;
};
```
