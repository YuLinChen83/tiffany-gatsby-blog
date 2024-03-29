---
title: '189. Rotate Array'
path: algorithm/189
tags: [leetcode, medium]
date: 2021-01-10
---

[LeetCode Link](https://leetcode.com/problems/rotate-array/)

Given an array, rotate the array to the right by _k_ steps, where _k_ is non-negative.
**Follow up:**
Try to come up as many solutions as you can, there are at least 3 different ways to solve this problem.  
Could you do it in-place with O(1) extra space?

### Example 1:

**Input:** nums = [1,2,3,4,5,6,7], k = 3
**Output:** [5,6,7,1,2,3,4]
**Explanation:**
rotate 1 steps to the right: [7,1,2,3,4,5,6]  
rotate 2 steps to the right: [6,7,1,2,3,4,5]  
rotate 3 steps to the right: [5,6,7,1,2,3,4]

### Example 2:

**Input:** nums = [-1,-100,3,99], k = 2
**Output:** [3,99,-1,-100]
**Explanation:**
rotate 1 steps to the right: [99,-1,-100,3]  
rotate 2 steps to the right: [3,99,-1,-100]

### Constraints:

- 1 <= nums.length <= 2 \* 10<sup>4</sup>
- -2<sup>31</sup> <= nums[i] <= <sup>31</sup> - 1
- 0 <= k <= 10<sup>5</sup>

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotate = function(nums, k) {
  k %= nums.length;
  while (k > 0) {
    nums.unshift(nums.pop());
    k--;
  }
};
```

```javascript
var rotate = function(nums, k) {
  k = k % nums.length;
  reverse(nums, 0, nums.length - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, nums.length - 1);
};
var reverse = (nums, start, end) => {
  while (start < end) {
    let tmp = nums[start];
    nums[start] = nums[end];
    nums[end] = tmp;
    start++;
    end--;
  }
};
```

說明舉例  
Original List : 1 2 3 4 5 6 7  
After reversing all numbers : 7 6 5 4 3 2 1  
After reversing first k numbers : _5 6 7_ 4 3 2 1  
After revering last n-k numbers (Result) : 5 6 7 _1 2 3 4_  
k%=nums.length 並分三次 reverse 即可得到所要的

### Complexity Analysis

- **Time complexity:** O(n)
- **Space complexity:** O(1)
