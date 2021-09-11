---
title: '121. Best Time to Buy and Sell Stock'
path: algorithm/20210829
tags: [leetcode, easy]
date: 2021-08-29
---

[LeetCode Link](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the *maximum profit* you can achieve from this transaction. If you cannot achieve any profit, return 0.

### Example 1:

**Input:** prices = [7,1,5,3,6,4]   
**Output:** 5


```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
    let profit = 0;
    let min = prices[0];
    for (let i = 1; i < prices.length; i++) {
        min = Math.min(min, prices[i]);
        profit = Math.max(profit, prices[i] - min);
    }
    return profit;
};
```
* 只能選一次，找出最小價＆其之後的profit