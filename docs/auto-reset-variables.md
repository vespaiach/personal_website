---
title: 'Auto-reset variables'
date: '2022-01-25T16:00:00.000-0500'
excerpt: 'In Javascript, is there a way to get variables automatically reseted to undefined value after being read once?'
github: https://github.com/vespaiach/personal_website/blob/main/docs/auto-reset-variables.md
tags: javascript
---

This question came to me when I was implementing a piece of code that needed to pass a value from one place to another place, and that value needed to be reseted to undefined after reading. 

Basically, I can achieve it easily by manually resetting the value after the reading statement. However, for the researching purpose, it is good to know if there are other ways to make variables somehow automatically reset their values after being read.

To do that, I used getter/setter syntax to create a variable onto window object and try to interfere with reading/writing of that variable. Then I used an array to hold the variable's values when it was set, and an index to keep the current position of that array. Everytime, the variable was read, just in increase the index one.

```javascript
Object.defineProperty(window, 'useOnceAndForget', {
  values: [],
  index: 0,

  get() {
    const returnVar = this.values[this.index];
    this.index++;
    return returnVar;
  },

  set(value) {
    this.values[this.index] = value;
  },
});
```

Done! the `useOnceAndForget` variable got reseted after being read. However, using an array seemed to be not efficient, the values in the array wouldn’t be collected by the garbage collector. So I remove the array and add a variable for checking the reading statement instead.

```javascript
Object.defineProperty(window, 'useOnceAndForget', {
  get() {
    if (this.isRead) {
      return undefined;
    }

    this.isRead = true;
    return this.value;
  },

  set(value) {
    this.isRead = false;

    this.value = value;
  },
});
```

With this solution, the value of `useOnceAndForget` variable wouldn’t be swept away right after reading, but until the next set statement. Not perfect, but acceptable...! To make the solution more general, I used Javascript Proxy and created a function to make any property of an object reset its value.

```javascript
function addAutoReset(obj, ...propNames) {
  const readingStatus = Object.fromEntries((propNames || []).map((p) => [p, false]));

  return new Proxy(obj, {
    get(target, prop) {
      if (readingStatus[prop] === undefined) return target[prop];

      if (readingStatus[prop] === true) return undefined;

      readingStatus[prop] = true;
      return target[prop];
    },

    set(target, prop, value) {
      if (readingStatus[prop] !== undefined) {
        readingStatus[prop] = false;
      }

      target[prop] = value;
    },
  });
}

const myObj = addAutoReset({ name: 'tony', age: 11 }, 'name', 'age');
```


