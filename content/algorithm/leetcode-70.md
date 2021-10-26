---
title: '70. Climbing Stairs'
path: algorithm/70
tags: [leetcode, easy]
date: 2021-10-26
---

[LeetCode Link](https://leetcode.com/problems/climbing-stairs/)

You are climbing a staircase. It takes `n` steps to reach the top.

Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?

### Example 1:

**Input:** n = 2
**Output:** 2
**Explanation:** There are two ways to climb to the top.

1. 1 step + 1 step
2. 2 steps

### Example 2:

**Input:** n = 3
**Output:** 3
**Explanation:** There are three ways to climb to the top.

1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step

```javascript
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
  if (n < 3) return n;
  const history = [0, 1, 2];
  for (let i = 3; i <= n; i++) {
    history[i] = history[i - 1] + history[i - 2];
  }
  return history[n];
};
```

- **Time complexity:** O(n)
- **Space complexity:** O(n)

```javascript
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
  if (n === 1) return 1;
  let step1 = 1,
    step2 = 2;
  for (let i = 3; i <= n; i++) {
    let step3 = step1 + step2;
    step1 = step2;
    step2 = step3;
  }
  return step2;
};
```

- **Time complexity:** O(n)
- **Space complexity:** O(1)

> - Dynamic Programming 題目
> - 找出規律 → 走到 n 階的方法相當於走到 n-1 階的方法和走到 n-2 階的方法和 (留最後一步的 1 或 2 階)
