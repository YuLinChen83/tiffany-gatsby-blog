---
title: '167. Two Sum II - Input array is sorted'
path: algorithm/20211025
tags: [leetcode, easy]
date: 2021-10-25
---

[LeetCode Link](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

Given a 1-indexed array of integers numbers that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific target number. Let these two numbers be `numbers[index1]` and `numbers[index2]` where `1 <= first < second <= numbers.length`.

Return the indices of the two numbers, `index1` and `index2`, as an integer array `[index1, index2]` of **length 2**.

The tests are generated such that there is exactly one solution. You may not use the same element twice.

```javascript
/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(numbers, target) {
  let l = 0,
    r = numbers.length - 1;
  while (numbers[l] + numbers[r] !== target) {
    numbers[l] + numbers[r] > target ? r-- : l++;
  }
  return [l + 1, r + 1];
};
```

- 在有排序好的情況下可以利用 pointer 動態移動以變大變小來控制
- 注意這邊回傳的不是 zero-base index

### 變化型

1. [Two Sum](http://localhost:8000/algorithm/20210710)
2. [Two Sum II - Input array is sorted](/algorithm/20211025)
3. [3Sum](/algorithm/20211026)
