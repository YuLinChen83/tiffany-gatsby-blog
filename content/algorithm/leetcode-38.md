---
title: '38. Count and Say'
path: algorithm/38
tags: [leetcode, easy]
date: 2021-01-07
---

[LeetCode Link](https://leetcode.com/problems/count-and-say/)

The count-and-say sequence is a sequence of digit strings defined by the recursive formula:

- `countAndSay(1) = "1"`
- `countAndSay(n)` is the way you would "say" the digit string from `countAndSay(n-1)`, which is then converted into a different digit string.<br/><br/>

To determine how you "say" a digit string, split it into the **minimal** number of groups so that each group is a contiguous section all of the **same character**. Then for each group, say the number of characters, then say the character. To convert the saying into a digit string, replace the counts with a number and concatenate every saying.

For example, the saying and conversion for digit string `"3322251"`: <br/><br/>
![](https://assets.leetcode.com/uploads/2020/10/23/countandsay.jpg) <br/><br/>
Given a positive integer `n`, return the **n<sup>th</sup>** term of the count-and-say sequence.<br/><br/>

### Example 1:

**Input:** n = 1
**Output:** "1"
**Explanation:** This is the base case.

### Example 2:

**Input:** n = 4
**Output:** "1211"
**Explanation:**
countAndSay(1) = "1"  
countAndSay(2) = say "1" = one 1 = "11"  
countAndSay(3) = say "11" = two 1's = "21"  
countAndSay(4) = say "21" = one 2 + one 1 = "12" + "11" = "1211"

### Constraints:

- `1 <= n <= 30`

```javascript
/**
 * @param {number} n
 * @return {string}
 */
var countAndSay = function(n) {
  if (n === 1) return '1';
  let tmp = '1';
  let say = '';
  let count;
  for (let i = 0; i < n - 1; i++) {
    count = 1;
    say = '';
    for (let j = 0; j < tmp.length; j++) {
      if (tmp[j] === tmp[j + 1]) count++;
      else {
        say = say + count + tmp[j];
        count = 1;
      }
    }
    tmp = say;
  }
  return say;
};
```

```javascript
/**
 * @param {number} n
 * @return {string}
 */
var countAndSay = function(n) {
  if (n === 1) return '1';
  let prev = countAndSay(n - 1);
  let say = '';
  let count = 1;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i + 1] && prev[i] == prev[i + 1]) count++;
    else {
      say = say + count + prev[i];
      count = 1;
    }
  }
  return say;
};
```

```javascript
/**
 * @param {number} n
 * @return {string}
 */
const countAndSay = function(n) {
  if (n === 1) return '1';
  const prev = countAndSay(n - 1);
  let result = '';
  for (let o = 0, i = 1; i <= prev.length; i++) {
    prev[i] !== prev[o] && ((result += `${i - o}${prev[o]}`), (o = i));
  }
  return result;
};
```

### Complexity Analysis

- **Time complexity:** O(n \* 2<sup>n</sup>)
- **Space complexity:** O(2<sup>n</sup>)
