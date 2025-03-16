---
title: 'Discard after x times usage'
date: '2022-01-25'
excerpt: 'I often find food labels warning me to discard the contents after X days of opening. A question: how can I create a variable that automatically discards its content after X uses?'
github: https://github.com/vespaiach/personal_website/blob/main/docs/discard=after-x-time-usage.md
tags: javascript
---

I often find food labels warning me to discard the contents after X days of opening. A question: how can I create a variable that automatically discards its content after X uses?

## Encapsulate within a closure function

A closure function with a usage counter inside seems an easy solution.

```javascript
function createPromoCode(validCode, maxUsages) {
  let usageCounter = 0;
  return function() {
    if (usageCounter < maxUsages) { 
      usageCounter++;
      return validCode;
    }
    return null;
  };
}

const promo = createPromoCode('free beer 🍻😆', 3);
console.log(`You are getting a ${promo()}`);
console.log(`You are getting a ${promo()}`);
console.log(`You are getting a ${promo()}`);
console.log(`You are getting a ${promo()}`);
```

## Place inside a Getter/Setter

JavaScript ES5 has getter and setter syntax, which fits very well as a solution.

```javascript
Object.defineProperty(window, 'discardAfterUsed', {
  get() {
    if (this.read) {
      return null;
    }

    this.read = true;
    return this.value;
  },

  set(value) {
    this.read = false;
    this.value = value;
  },
});

window.discardAfterUsed = 'one-time free beer'
console.log(`You are getting a ${discardAfterUsed}`);
console.log(`You are getting a ${discardAfterUsed}`);
```

## Implement a class

While defining a property on the window object is quick for demonstration purposes, it's not a practical solution. Instead, let's build a class for it.

```javascript
class DiscardAfterUsed {
  constructor(value) {
    this._value = value;
  }

  get value() {
    if (this._value !== null && this._value !== undefined) {
      const temp = this._value;
      this._value = null; // Ready for garbage collector
      return temp;
    }
    return null;
  }
}

const onceOnly = new DiscardAfterUsed('one-time free beer');

console.log(`You are getting a ${onceOnly.value}`);
console.log(`You are getting a ${onceOnly.value}`);
```

## Use proxy

Using a proxy is often more complex than other solutions, but it is flexible and does not modify the original value.

```javascript
const discardAfterUsedHandler = {
  get: function(target, prop, receiver) {
    if (prop !== 'code') {
      return Reflect.get(target, prop, receiver);
    }

    if (!receiver.read) {
      receiver.read = true;
      return target[prop];
    }
    return null; 
  }
};

const promo = { code: 'one-time free beer' };
const proxiedObj = new Proxy(promo, discardAfterUsedHandler);
console.log(`You are getting a ${proxiedObj.code}`);
console.log(`You are getting a ${proxiedObj.code}`);
```

In conclusion, while there are various 'discard-after-use' solutions, I prefer creating a class for it. It is clean and easy to understand. However, in terms of flexibility, the proxy solution is an excellent choice.