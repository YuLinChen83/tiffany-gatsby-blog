---
title: "118. Pascal's Triangle"
path: 'algorithm/20210108'
tags: [leetcode, easy]
date: 2021-01-08
---

[LeetCode Link](https://leetcode.com/problems/pascals-triangle/)

Given a non-negative integer `numRows`, generate the first `numRows` of **Pascal's triangle**.  
![](https://upload.wikimedia.org/wikipedia/commons/0/0d/PascalTriangleAnimated2.gif)  
In Pascal's triangle, each number is the sum of the two numbers directly above it.

### Example:

**Input:** 5
**Output:**
[
[1],
[1,1],
[1,2,1],
[1,3,3,1],
[1,4,6,4,1]
]

```javascript
/**
 * @param {number} numRows
 * @return {number[][]}
 */
var generate = function(numRows) {
  const result = [];
  for (let i = 1; i <= numRows; i++) {
    let tmpArr = new Array(i).fill(1);
    const lastArr = result[i - 2];
    for (let j = 1; j < i - 1; j++) {
      tmpArr[j] = lastArr[j - 1] + lastArr[j];
    }
    result.push(tmpArr);
  }
  return result;
};
```

### Complexity Analysis

- **Time complexity:** `O(n^2)`
- **Space complexity:** `O(1)`
