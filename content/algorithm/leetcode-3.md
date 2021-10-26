---
title: '3. Longest Substring Without Repeating Characters'
path: algorithm/3
tags: [leetcode, medium]
date: 2021-07-11
---

[LeetCode Link](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

Given a string `s`, find the length of the **longest substring** without repeating characters.

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  let leftBound = 0;
  let maxLength = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = leftBound; j < i; j++) {
      if (s[i] === s[j]) {
        leftBound = j + 1;
        break;
      }
    }
    maxLength = Math.max(i - leftBound + 1, maxLength);
  }
  return maxLength;
};

console.log(lengthOfLongestSubstring('abcabcbb')); //3
console.log(lengthOfLongestSubstring('bbbbb')); //1
console.log(lengthOfLongestSubstring('pwwkew')); //3
console.log(lengthOfLongestSubstring('abba')); //2
```

- 遇到重複字元則以先前重複字的下一位做為 leftBound
