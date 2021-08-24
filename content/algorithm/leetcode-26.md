---
title: '26. Remove Duplicates from Sorted Array'
path: algorithm/20210110
tags: [leetcode, easy]
date: 2021-01-10
---

[LeetCode Link](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)

Given a sorted array nums, remove the duplicates **in-place** such that each element appears only once and returns the new length.  
Do not allocate extra space for another array, you must do this by modifying the input array **in-place** with **O(1)** extra memory.

### Example 1:

**Input:** nums = [1,1,2]  
**Output:** 2, nums = [1,2]  
**Explanation:** Your function should return length = 2, with the first two elements of nums being 1 and 2 respectively. It doesn't matter what you leave beyond the returned length.

### Example 2:

**Input:** nums = [0,0,1,1,1,2,2,3,3,4]  
**Output:** 5, nums = [0,1,2,3,4]  
**Explanation:** Your function should return length = 5, with the first five elements of nums being modified to 0, 1, 2, 3, and 4 respectively. It doesn't matter what values are set beyond the returned length.

### Constraints:

- 0 <= nums.length <= 3 \* 10<sup>4</sup>
- -10<sup>4</sup> <= nums[i] <= 10<sup>4</sup>
- nums is sorted in ascending order.

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(array) {
  let n = 0,
    index = 0;
  while (n < array.length) {
    if (n == 0 || array[n] !== array[n - 1]) {
      array[index] = array[n];
      n++;
      index++;
    } else {
      n++;
    }
  }
  return index;
};
```

```javascript
var removeDuplicates = function(nums) {
  let n = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== nums[n]) {
      n++;
      nums[n] = nums[i];
    }
  }
  return n + 1;
};
```

### Complexity Analysis

- **Time complexity:** O(n)
- **Space complexity:** O(1)
