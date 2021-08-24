---
title: '1. Two Sum'
path: algorithm/20210710
tags: [leetcode, easy]
date: 2021-07-10
---

[LeetCode Link](https://leetcode.com/problems/two-sum/)

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  const m = {};
  for (let i = 0; i < nums.length; i++) {
    if (m[target - nums[i]] !== undefined) {
      return [m[target - nums[i]], i];
    }
    m[nums[i]] = i;
  }
};

console.log(twoSum([2, 7, 11, 15], 9)); // [0,1]
```
* 可以一次存 number 和其 index