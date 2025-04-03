---
title: 'Discard after usages'
date: '2022-01-25'
updatedAt: '2022-01-25'
excerpt: 'Learn how to create self-discarding variables in JavaScript using closures, classes, proxies, and more. Explore practical implementations for managing variable usage limits effectively.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/discard-after-usages.md
tags: javascript
---

Have you ever noticed food labels warning you to discard the contents after a certain number of days? That made me wonder: how can we create a variable in JavaScript that automatically discards its content after X uses? Let's explore some implementations.

## Encapsulate within a closure function

A closure is a simple and effective way to encapsulate state. By maintaining a usage counter within the closure, we can track the number of times a value is accessed.

```javascript
function createPromoCode(validCode, maxUsages) {
  // Closure keeps state private, avoiding external modifications.
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

While defining a property on the window object is quick for demonstration purposes, it's not a practical solution.

## Implement a class

A more structured approach involves creating a class, making it reusable and clear.

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

In conclusion, if you need a straightforward solution, closures work well. For a more reusable and structured approach, a class is ideal. When handling multiple properties dynamically, proxies offer the most flexibility.