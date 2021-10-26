---
title: '82. Remove Duplicates from Sorted List II'
path: algorithm/82
tags: [leetcode, medium]
date: 2021-01-05
---

[LeetCode Link](https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/)

Given the head of a sorted linked list, **delete** all nodes that have duplicate numbers, leaving only distinct numbers from the original list. Return the linked list **sorted** as well.

### Example 1:

**Input:** head = [1,2,3,3,4,4,5]
**Output:** [1,2,5]

### Example 2:

**Input:** head = [1,1,1,2,3]
**Output:** [2,3]

### Constraints:

- The number of nodes in the list is in the range `[0, 300]`.
- `100 <= Node.val <= 100`
- The list is guaranteed to be **sorted** in ascending order.

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var deleteDuplicates = function(head) {
  const dummy = new ListNode(0);
  dummy.next = head;
  let cur = head;
  let prev = dummy;
  let duplicate = null;

  while (cur && cur.next) {
    if (cur.val === duplicate || cur.val === cur.next.val) {
      duplicate = cur.val;
      prev.next = cur.next;
    } else {
      prev = prev.next;
    }
    cur = cur.next;
  }
  if (cur && cur.val === duplicate) {
    prev.next = null;
  }
  return dummy.next;
};
```

```javascript
var deleteDuplicates = function(head) {
  let pre = new ListNode(0);
  pre.next = head;
  let node = pre;

  while (node.next && node.next.next) {
    if (node.next.val === node.next.next.val) {
      let val = node.next.val;
      while (node.next && node.next.val == val) {
        node.next = node.next.next;
      }
    } else {
      node = node.next;
    }
  }

  return pre.next;
};
```

### Complexity Analysis

- **Time complexity:** `O(n)`
- **Space complexity:** `O(1)`
