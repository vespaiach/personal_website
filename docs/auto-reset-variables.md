---
title: 'Auto-reset variables'
date: '2022-01-25'
excerpt: 'Is there a way to get variables automatically reseted to default value after reading once in Javascript?'
github: https://github.com/vespaiach/personal_website/blob/main/docs/aut-reset-variables.md
tags: javascript,variables
---

This question came to me when I was implementing a piece of code that needed to set a value to a variable, and after that variable was read, it needed to be set back to null or undefined. Well, that was not a problem, let set it to null after reading it...Yes, it was, but the question was about whether variables somehow automatically set it to null after reading.

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

Done! the `useOnceAndForget` variable got reseted after being read. However, using an array seemed to be not efficient, the values it holds wouldn’t be collected by the garbage collector. So I remove the array and add a variable for checking the reading statement instead.

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

With this solution, the value of `useOnceAndForget` variable wouldn’t be swept away right after reading, but until the next set statement. Not perfect, but acceptable...! Great! the solution worked well, but how about defined a variable in a module instead of global scope.


