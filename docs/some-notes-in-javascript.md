---
title: 'Some notes in Javascript'
date: '2022-01-26T00:00:00.000-0500'
excerpt: 'Here is a collection of some notes those I think Javacript developers should know about in order to make their Javascript code more precise.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/some-notes-in-javascript.md
tags: javascript
---

## Self-compare variables

Sometimes, we will see the self-comparison like the code below

```javascript
function compare(value newVal) {
  if (newVal === value || (newVal !== newVal && value !== value)) // is equal
}
```

That means the author just wants to include possible `NaN` value of the newVal variable and value variable in the comparision, because in Javascript NaN is not equal to NaN `NaN !== NaN`.

## Symbol is unique

The symbol is the newest primitive type added in ES6 (find the document [here](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-symbol-type)). We can use Symbol to create unique constants.

```javascript
const UNI = Symbol('I am unique');
const ANOTHER_UNI = Symbol('I am unique');

UNI === ANOTHER_UNI // false
Symbol() === Symbol() // false
```

## Math.floor is a rounding function

We might assume that `Math.floor` simply truncates the decimal number, but it's good to know that Math.floor is a rounding function.

```javascript
Math.floor(1.1) // 1
Math.floor(-1.1) // -2
```

To truncate a number, let's use `Math.trunc(x)`

## Use bitwise to truncate decimal numbers

The `n|0` or `n >> 0` operation simply truncates the decimal number n, because all bitwise operations in Javascript works with  32-bit integers only. 

```javascript
(5.1 | 0) === 5
(5.1 >> 0) === 5
```

Since, we have `Math.trunc(x)` function now, let's stop using it. Otherwise, we have to aware of some odd comparision.

```javascript
(NaN | 0) === 0
```




