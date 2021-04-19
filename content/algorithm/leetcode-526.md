---
title: '526. Beautiful Arrangement'
path: algorithm/20210104
tags: [leetcode, medium]
date: 2021-01-04
---

[LeetCode Link](https://leetcode.com/problems/beautiful-arrangement/)

Suppose you have `n` integers labeled `1` through `n`. A permutation of those `n` integers `perm` (1-indexed) is considered a beautiful arrangement if for every `i` (`1 <= i <= n`), either of the following is true:

- `perm[i]` is divisible by `i`.
- `i` is divisible by `perm[i]`.
- Given an integer `n`, return the number of the beautiful arrangements that you can construct.

### Example 1:

**Input:** n = 2  
**Output:** 2  
**Explanation:**  
The first beautiful arrangement is [1,2]:

- perm[1] = 1 is divisible by i = 1
- perm[2] = 2 is divisible by i = 2

The second beautiful arrangement is [2,1]:

- perm[1] = 2 is divisible by i = 1
- i = 2 is divisible by perm[2] = 1

### Example 2:

**Input:** n = 1  
**Output:** 1

### Constraints:

- `1 <= n <= 15`

```javascript
/**
 * @param {number} n
 * @return {number}
 */
var countArrangement = function (n) {
  if (n === 0) return 0;
  let ans = 0,
    map = new Map(),
    usedMap = new Map();

  // 整理第i位合法nums的Map
  for (let i = 1; i <= n; i++) {
    usedMap.set(i, false);
    let temp = [];
    for (let j = 1; j <= n; j++) {
      if (j % i === 0 || i % j === 0) temp.push(j);
    }
    map.set(i, temp);
  }
  
  // n!地遍歷各組合
  function backtrack(curr) {
    if (curr.length === n) {
      ans++;
      return;
    }
    let need = map.get(curr.length + 1);
    for (let i = 0; i < need.length; i++) {
      if (usedMap.get(need[i]) === true) continue;
      curr.push(need[i]);
      usedMap.set(need[i], true);
      backtrack(curr);
      const pop = curr.pop();
      usedMap.set(need[i], false);
    }
  }
  backtrack([]);

  return ans;
};
```