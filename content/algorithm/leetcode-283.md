---
title: '283. Move Zeroes'
path: algorithm/20210712
tags: [leetcode, easy]
date: 2021-07-12
---

[LeetCode Link](https://leetcode.com/problems/move-zeroes/)

Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.

Note that you must do this **in-place** without making a copy of the array.

```javascript
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function (nums) {
  let j = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] != 0) {
      nums[j] = nums[i];
      nums[i] = i === j ? nums[i] : 0;
      j++;
    }
  }
  return nums;
};
console.log(moveZeroes([0,1,0,3,12]));

/**
[ 0, 1, 0, 3, 12 ]
[ 1, 0, 0, 3, 12 ]
[ 1, 3, 0, 0, 12 ]
[ 1, 3, 12, 0, 0 ]
**/

```
* 非 0 數最後都依序從最左開始放置 -> 設置目前最左可放非 0 數的 index