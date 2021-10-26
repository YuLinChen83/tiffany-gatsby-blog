---
title: 'Hostnames tracker'
path: algorithm/o1
tags: [algorithm]
date: 2021-08-24
---

心血來潮寫個 Cakeresume 的 React 測驗，其中有一題實作題目紀錄下

Hostnames consist of an alphabetic host type (e.g. `"apibox"`) concatenated with a host number (eg: `"apibox1"`, `"apibox2"`, etc. are valid hostnames).

Your task is to create a class called `Tracker` that supports two operations:

- `allocate(hostType)`, which reserves the first available hostname and returns it;
- `deallocate(hostname)`, which should release that hostname back into the pool.

The input for this task is an array of sequential queries in string form, where a query of type "A <hostType>" means a call to `tracker.allocate(<hostType>)`, and query of type `"D <hostname>"` means a call tracker.deallocate(<hostname>). The output should be an array of return values of all allocate calls.

There is already a prewritten piece of code that handles the input / output and makes allocate / deallocate calls, so you just need to create the `Tracker` class that implements them.

Note that deallocating a non-allocated hostname is a valid operation.

### Example:

**Input:** `["A apibox", "A apibox", "D apibox1", "A apibox", "A sitebox"]`  
**Output:** `hostAllocation(queries) = ["apibox1", "apibox2", "apibox1", "sitebox1"]`

```sh
>> tracker.allocate('apibox');
"apibox1"

>> tracker.allocate('apibox');
"apibox2"

>> tracker.deallocate('apibox1');

>> tracker.allocate('apibox');
"apibox1"

>> tracker.allocate('sitebox');
"sitebox1"
```

```javascript
const getNextNum = (nums) => {
  let nextNum = 1;
  let stop = false;
  while (!stop) {
    if (nums.includes(nextNum)) nextNum++;
    else stop = true;
  }
  return nextNum;
};

class Tracker {
  constructor() {
    this.hostnames = {};
  }

  allocate(hostType) {
    if (!this.hostnames[hostType]) {
      this.hostnames[hostType] = [];
    }
    const nextNum = getNextNum(this.hostnames[hostType]);
    this.hostnames[hostType].push(nextNum);
    return `${hostType}${nextNum}`;
  }

  deallocate(hostname) {
    const matches = hostname.match(/([a-z]+)(\d+)/);
    if (!Array.isArray(matches)) {
      throw new Error('Invalid input');
    }
    const hostType = matches[1];
    const num = +matches[2];
    const index = this.hostnames[hostType]?.indexOf(num);
    if (index > -1) {
      this.hostnames[hostType].splice(index, 1);
    }
  }
}

function hostAllocation(queries) {
  const tracker = new Tracker();
  const results = [];
  queries.forEach((query) => {
    const [action, name] = query.split(' ');
    if (action === 'A') {
      results.push(tracker.allocate(name));
    } else if (action === 'D') {
      tracker.deallocate(name);
    }
  });
  return results;
}

console.log(hostAllocation(['A apibox', 'A apibox', 'D apibox1', 'A apibox', 'A sitebox']));
// ["apibox1", "apibox2", "apibox1", "sitebox1"]
```
