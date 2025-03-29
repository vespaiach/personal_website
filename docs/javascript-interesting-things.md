---
title: 'JavaScript: Interesting Facts for Developers'
date: '2022-01-26T00:00:00.000-0500'
excerpt: 'Discover essential JavaScript concepts and tips to enhance your coding skills, including unique features, best practices, and advanced techniques for writing precise and efficient JavaScript code.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/javascript-interesting-things.md
tags: javascript
---

## Self-compare variables

Sometimes, we will see the self-comparison like the code below:

```javascript
function compare(value newVal) {
  if (newVal === value || (newVal !== newVal && value !== value)) // is equal
}
```

That means the author just wants to include possible **NaN** value of the newVal variable and value variable in the comparision, because in Javascript NaN is not equal to NaN **NaN !== NaN**.

```javascript
function isValidNumber(value) {
  return value === value; // Returns false only if value is NaN
}

console.log(isValidNumber(5));   // true
console.log(isValidNumber(NaN)); // false
```

## Symbol is unique

The symbol is the newest primitive type added in ES6 ([see  documentation](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-symbol-type)). We can use Symbol to create unique constants.

```javascript
const UNI = Symbol('I am unique');
const ANOTHER_UNI = Symbol('I am unique');

UNI === ANOTHER_UNI; // false
Symbol() === Symbol(); // false
```

## Math.floor is a rounding function

We might assume that **Math.floor** simply truncates the decimal number, but it's good to know that Math.floor is a rounding function.

```javascript
Math.floor(1.1); // 1
Math.floor(-1.1); // -2
```

To truncate a number, let's use **Math.trunc(x)**

## Use bitwise to truncate decimal numbers

The `n|0` or `n >> 0` operation simply truncates the decimal number n, because all bitwise operations in Javascript works with 32-bit integers only.

```javascript
(5.1 | 0) === 5;
(5.1 >> 0) === 5;
```

Since, we have **Math.trunc(x)** function now, let's not use bitwise-truncating. Otherwise, we have to aware of some odd comparision.

```javascript
(NaN | 0) === 0;
```

Note: bitwise operations can be faster than Math.trunc in some JavaScript engines, but this is highly dependent on the browser/runtime. The performance benefits are usually negligible, so readability is more important.

## Comma operator (,)

The comma operator evaluates each of its operands (from left to right) and returns the value of the last operand. It is often used to include multiple expressions in a location that requires a single expression, such as the increment section of a for loop.

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

function withFunc(a, b) {
  console.log(a, b);
}

let x = 1;
withFunc((x++, x + 1), x * 2); // Output: 2 3, 4
//x becomes 2 (x++), then (x + 1) becomes 3. x is still 2, so (x * 2) is 4
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
const result = x && (y + 1);
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

Or void(0), or void keyword and follow by any number is actually **undefined** value.

```javascript
void 0 === undefined;
void 0 === undefined;
void 1 === undefined;
```

**void** keyword makes sure that its following expression will be executed and then undefined value will be returned.

```javascript
function hi() {
  return 'hi';
}

void hi(); // undefined

const a = () => void hi(); // a() will return undefined
```

## Coercion

JavaScript automatically converts values between types. This is convenient but can lead to subtle bugs if we're not careful. Use strict equality (===) to avoid type coercion and ensure that you're comparing values of the same type. Go enforces stricter type rules, requiring explicit type conversions in many cases, which avoids unexpected results but can be more verbose.

```javascript
console.log("5" + 3);       // Output: "53" (string concatenation)
console.log("5" - 3);       // Output: 2  (string converted to number)
console.log(5 == "5");      // Output: true (loose equality, string converted to number)
console.log(5 === "5");     // Output: false (strict equality, types must be the same)
console.log(true + 1);      // Output: 2  (boolean converted to number: true -> 1)
console.log(null == undefined); // Output: true
```

## Truthiness & Falsiness

When JavaScript expects a boolean value (e.g., in an if condition, a while loop, or with the ! not operator), it implicitly coerces the value to either true or false based on this truthiness/falsiness.

These are the values that JavaScript will treat as false in a boolean context: (Falsy values)

1. false: The literal boolean false.

2. 0 (Zero): The number zero.

3. "" (Empty String): An empty string (a string with no characters).

4. null: Represents the intentional absence of any object value.

5. undefined: Indicates that a variable has been declared but has not been assigned a value.

6. NaN (Not a Number): Represents an invalid numerical value (e.g., the result of 0/0).

Any value that is not on the falsy list is considered truthy. This includes:

1. true: The literal boolean true.
2. Any Non-Zero Number: 1, -1, 3.14, Infinity, -Infinity, etc.
3. Any Non-Empty String: "Hello", " ", "0", "false" (even if the string contains the word "false").
4. Objects: {}, { name: "Alice" } (even if the object is empty).
5. Arrays: [], [1, 2, 3] (even if the array is empty).
6. Functions: function() {}.
7. Symbols: Symbol("description").

```javascript
if ("Hello") {
  console.log("This will run because 'Hello' is truthy.");
}

if (0) {
  console.log("This will NOT run because 0 is falsy.");
}

// Logical OR (||) operator
const name = "";
const defaultName = name || "Guest";  // If name is falsy, use "Guest"
console.log(defaultName); // Output: "Guest"

const age = 25;
const displayAge = age || 0; // age is truthy, so it is assigned to the variable.
console.log(displayAge); // Output: 25

// Logical AND (&&) operator
const user = { name: "Bob" };
user && console.log("User exists"); // "User exists" will be logged because user is truthy

const emptyUser = null;
emptyUser && console.log("Empty user exists"); // Nothing will be logged because emptyUser is falsy

// Not operator (!)
console.log(!true); // Output: false
console.log(!0);    // Output: true (because 0 is falsy, !0 is true)
console.log(!!0);   // Output: false (double negation)
```
