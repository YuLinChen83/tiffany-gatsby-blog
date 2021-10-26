---
title: '53. Maximum Subarray'
path: algorithm/53
tags: [leetcode, easy]
date: 2021-08-29
---

[LeetCode Link](https://leetcode.com/problems/maximum-subarray/)

Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.

### Example 1:

**Input:** nums = [-2,1,-3,4,-1,2,1,-5,4]
**Output:** 6
**Explanation**: [4,-1,2,1] has the largest sum = 6.

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
  let cur = nums[0];
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], nums[i] + cur);
    if (cur > max) max = cur;
  }
  return max;
};
```

- 當前與過去加當前之間比較
