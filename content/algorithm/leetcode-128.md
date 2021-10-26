---
title: '128. Longest Consecutive Sequence'
path: algorithm/128
tags: [leetcode, medium]
date: 2021-08-26
---

[LeetCode Link](https://leetcode.com/problems/longest-consecutive-sequence/)

Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in `O(n)` time.

### Example 1:

**Input:** nums = [100,4,200,1,3,2]  
**Output:** 4  
**Explanation:** The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.

### Example 2:

**Input:** nums = [0,3,7,2,5,8,4,6,0,1]  
**Output:** 9

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function(nums) {
  let maxLen = 0;
  const numsSet = new Set(nums);
  for (let left of numsSet) {
    if (numsSet.has(left - 1)) continue; // 有小的等到小的再比
    let right = left + 1;
    while (numsSet.has(right)) {
      right++;
    }
    maxLen = Math.max(maxLen, right - left);
  }
  return maxLen;
};
```
