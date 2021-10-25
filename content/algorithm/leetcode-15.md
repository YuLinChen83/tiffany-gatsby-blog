---
title: '15. 3Sum'
path: algorithm/20211026
tags: [leetcode, medium]
date: 2021-10-26
---

[LeetCode Link](https://leetcode.com/problems/3sum/submissions/)

Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
  if (nums.length < 3) return [];
  nums.sort((a, b) => a - b);
  const ans = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let j = i + 1,
      k = nums.length - 1;
    while (j < k) {
      const sum = nums[i] + nums[j] + nums[k];
      if (sum === 0) {
        ans.push([nums[i], nums[j], nums[k]]);
        while (nums[j] === nums[j + 1]) j++;
        while (nums[k] === nums[k - 1]) k--;
        j++;
        k--;
      } else if (sum > 0) k--;
      else j++;
    }
  }
  return ans;
};
```

- 排序完後只需控另外兩個，做法類似 167.
- 要注意的是不能出現重複組合，j、k 在 while 中處理但 i 要回頭方式 check，不然遇到 `[ -1, -1, 0, 2]` 這種就把需要的跳過了

### 變化型

1. [Two Sum](http://localhost:8000/algorithm/20210710)
2. [Two Sum II - Input array is sorted](/algorithm/20211025)
3. [3Sum](/algorithm/20211026)
