---
title: 'Some notes in Javascript'
date: '2022-01-26T00:00:00.000-0500'
excerpt: 'Here is a collection of some notes those I think Javacript developers should know about, in order to make their Javascript code more precise.'
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

UNI === ANOTHER_UNI; // false
Symbol() === Symbol(); // false
```

## Math.floor is a rounding function

We might assume that `Math.floor` simply truncates the decimal number, but it's good to know that Math.floor is a rounding function.

```javascript
Math.floor(1.1); // 1
Math.floor(-1.1); // -2
```

To truncate a number, let's use `Math.trunc(x)`

## Use bitwise to truncate decimal numbers

The `n|0` or `n >> 0` operation simply truncates the decimal number n, because all bitwise operations in Javascript works with 32-bit integers only.

```javascript
(5.1 | 0) === 5;
5.1 >> 0 === 5;
```

Since, we have `Math.trunc(x)` function now, let's not use bitwise-truncating. Otherwise, we have to aware of some odd comparision.

```javascript
(NaN | 0) === 0;
```

## Comma operator (,)

The comma operator is used to separate one or more expressions when we want to combine multiple expressions in one location, and those expressions will be executed orderly from left to right. Value of the last statement will be the returning value of all expressions.

Actually, we see the comma operator a lot in for loop statement, but some developers might use it a reduce function, such as the code below.

```javascript
// In for...loop statement
let i = 0;
let j = 10;
for( ; i < j; i++, j--)

/**
 * In a reduce function.
 * To produce a name map:
 *
 * namesMap = {
 *  Tony: true,
 *  Nick: true,
 *  Rose: true,
 *  Jane: true
 * }
 */
const names = ['Tony', 'Nick', 'Rose', 'Jane'];
const namesMap = names.reduce((acc, n) => (acc[n] = true, acc), {});
```

## Short-circuit evaluation

Let's say we have multiple expressions needed to be evaluated from left to right and the evaluation should stop immediately whether it meets a certain condition. That's short-circuit evaluation. Usually, logical operators AND and OR are used for the evaluation.

```javascript
const x = 1;
const y = 0;
const z = 2;

const result1 = x && y && z;
// the evaluation will stop at y and return 0

const result2 = x || y || z;
// the evaluation will stop at x and return 1
```

It's worth noting that the group operator () won't change the order of evaluation

```javascript
const x = false;
const y = 1;

/**
 * We may expect result = 2, in fact,
 * (y + 1) won't be executed first.
 *
 * Whole evaluation will stop at x, because of x = false
 */
const result = x && y + 1;
```

We also can use optional chain ?. operator to short-circuit expressions.

```javascript
/**
 * If x is null/undefined,
 * the expression will stop and return undefined.
 *
 * result can be undefined or a string
 */
const result = x?.person.name;
```

## void 0

Or void(0), or void keyword and follow by any number is actually `undefined` value.

```javascript
void 0 === undefined;
void 0 === undefined;
void 1 === undefined;
```

`void` keyword makes sure that its following expression will be executed and then undefined value will be returned.

```javascript
function hi() {
  return 'hi';
}

void hi(); // undefined

const a = () => void hi(); // a() will return undefined
```
