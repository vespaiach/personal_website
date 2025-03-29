---
title: 'Typescript Notes'
date: '2025-03-23'
excerpt: "Discover essential TypeScript concepts, including types like any, unknown, and never, type inference, type guards, and advanced features like the satisfies keyword. Perfect for developers starting with TypeScript!"
github: https://github.com/vespaiach/personal_website/blob/main/docs/typescript-notes.md
tags: typescript
---

In this post, I am outlining some fundamental notes about TypeScript that I believe will be helpful for developers starting their coding journey with TypeScript. Let's dive in!

## any type

The **any** type is useful when we truly don't know the type of values or when we want to bypass TypeScript's type-checking. Essentially, any represents the absence of a specific type.

**When to use:**

- It's best to avoid using any whenever possible. Treat it as a last-resort "escape hatch" from the type system—use it only in scenarios where declaring the type is overly complex or requires excessive effort, or when we need the code to work temporarily and plan to fix it later..

## unknown type

The unknown type is a type-safe alternative to any. It is considered a "top type" in TypeScript, meaning any value of any type can be assigned to it. However, TypeScript compiler requires us to perform type-checking on an unknown value before we can use it.

**When to use:**

- Use unknown as a safer alternative to any. It ensures that you explicitly verify the type of a value before using it in your code.

## never type

The **never** type is a specialized type in TypeScript that represents values that never occur. Examples include functions that never return, variables that can never hold a value, or situations that are impossible to happen. It is considered a "bottom type" in TypeScript, meaning it can be assigned to any type, but no type is assignable to never.

**When to use:**

- Annotate functions with never if they throw errors or enter infinite loops.
- Use never in conditional types to narrow results.

```typescript
// Function that throws error
function throwError(message: string): never {
  throw new Error(message);
}

// Function that never stop
function runInfiniteLoop (): never {
  while (true) { }
}

// Conditional type-checking
type NonNullable<T> = T extends null | undefined ? never : T;
```

## Top type vs bottom type

These are not annotations in TypeScript, but it's useful to understand these terms. In the hierarchy of types, a top type is a supertype of all other types, meaning every other type is a subtype of it. Conversely, a bottom type is a subtype of all other types.

Any value of any type can be assigned to a top type. In TypeScript, any and unknown are two top types, with unknown being the safer alternative.

A value of the bottom type can be assigned to a variable of any other type, but the reverse is not true.

Here's a visual representation of the hierarchy:

```base
   Top Type (any or unknown)
     / | \
    /  |  \
Type1 Type2 Type3 ...
   \  |  /
    \ | /
  Bottom Type (never)
```

We can think of a top type as a very large type that can accommodate any other type. In contrast, a bottom type is extremely small, it can fit into other types, but other types cannot fit into a bottom type.

## When type inference is not enough

TypeScript's type inference is highly effective. Without explicit type annotations, the TypeScript compiler can often infer the type of a value based on code expressions or context. However, it isn't always precise and may require guidance from us to identify the correct value type. When this occurs, we can use the following techniques to assist the TypeScript compiler:

**Type Assertion**

Use **as** keyword in type assertion, when we know the type of value better than Typescript compiler, and we want to overide what Typescript compiler inference. Note that, the as keyword will change the type of value

```typescript
const someValue: unknown = "This is a string";
const lenOfSomeValue = (someValue as string).length;

//HTMLElement type narrowing
const myCanvas = document.getElementById("id-of-element") as HTMLCanvasElement;
```

**Type Guard**

This is another way of saying that we are providing more context for the compiler to guess the correct type. Look at the type hierarchy tree,the top type is too broad, and we aim to move down toward the bottom type, So by using the type guard techniques below, we can narrow down the type of a value to achieve greater precision.

Use typeof operator

```typescript
function format(value: string | number): string {
  if (typeof value === "string") {
    return value  
  }
  return value.toFixed(2)
}

format("2.34");  // Output: 2.34 
format(10);     // Output: 10.00 
```

Use instanceof operator

```typescript
class Animal {
  speak(noise: string) {
    console.log(noise);
  }
}

class Dog extends Animal {
  bark() {
    this.speak("Woof!");
  }
}

function makeNoise(animal: Animal) {
  if (animal instanceof Dog) {
    // TypeScript knows 'animal' is a Dog here
    animal.bark();
  } else {
    console.log(animal.speak("Generic animal sound"));
  }
}

const myDog = new Dog();
const myAnimal = new Animal();

makeNoise(myDog);    // Output: Woof!
makeNoise(myAnimal); // Output: Generic animal sound
```

Use custom type guard

```typescript
// The same as above example but now we define a method for checking type
class Animal {
  speak(noise: string) {
    console.log(noise);
  }
}

class Dog extends Animal {
  bark() {
    this.speak("Woof!");
  }
}

function isDog(animal: Animal): animal is Dog {
  return (animal as Dog).bark !== undefined;
}

function makeNoise(animal: Animal) {
  if (isDog(animal)) {
    // TypeScript knows 'animal' is a Dog here
    animal.bark();
  } else {
    console.log(animal.speak("Generic animal sound"));
  }
}

const myDog = new Dog();
const myAnimal = new Animal();

makeNoise(myDog);    // Output: Woof!
makeNoise(myAnimal); // Output: Generic animal sound
```

Use in operator

```typescript
type Car = { wheels: number, drive: () => void };
type Airplane = { sails: number, sail: () => void };

function move(vehicle: Car | Boat) {
    if ("drive" in vehicle) {
        vehicle.drive(); // TypeScript knows it's a Car
    } else {
        vehicle.sail(); // TypeScript knows it's a Boat
    }
}
```

Discriminated unions are a technique in which we define a common property for each object in the union. This property holds a unique value that represents each object.

```typescript
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; side: number };

function getArea(shape: Circle | Square) {
    if (shape.kind === "circle") {
        return Math.PI * shape.radius ** 2;
    } else {
        return shape.side ** 2;
    }
}
```

## Typescript's satisfies keyword

There are cases where we want to preserve what the TypeScript compiler infers, but we also want to add stricter type-checking. The satisfies keyword allows us to enforce stricter type-checking against specific shapes of a type while maintaining the inferred type without losing precision or unnecessarily widening it.

```typescript
type Setting = { mode: "light" | "dark"; font: string };
const setting = { mode: "light", font: "mono" } satisfies Setting;
/**
 * By using satisfies Setting, we instruct TypeScript to:
 * - Keep the inferred type of the `setting` variable.
 * - Perform type-checking against the Setting type.
 * 
 * The resulting type of the `setting` variable is:
 * 
 * const setting: {
 *   mode: "light";
 *   font: string;
 * }
 */
```

Another example of using satisfies to check a type without widening the inferred type:

```typescript
type Contact = { address?: string; phone?: string };

// Example 1: Explicit declaration widens the type
const contact1: Contact = { address: '123 ABC street' };
contact1.address;
/**
 * contact1.address will have the type string | undefined because we explicitly declare
 * contact1 as a Contact type. This results in a widened type, which may not be what we want.
 **/

// Example 2: Using satisfies to preserve the inferred type
const contact2 = { phone: '+16678889990' } satisfies Contact;
contact2.phone;
/**
 * contact2.phone will have the type string only, as inferred by TypeScript.
 * Additionally, contact2 will still be checked against the Contact type.
 **/
```

## Contextual Typing

When determining the type of a value, TypeScript also uses the surrounding context to infer types.

```typescript
const button = document.getElementById("#button");
button.addEventListener("click", (event) => {
  /**
   * `event` is inferred as MouseEvent.
   * TypeScript uses the button element and the addEventListener method 
   * to infer the type of `event`.
   **/
  console.log(event.clientX);
});
```

## Structural Typing

In TypeScript, if two objects have the same shape (i.e., the same properties and types), they are considered compatible, even if they belong to different types.

```typescript
type Person = { name: string; age: number };
type Employee = { name: string; age: number; employeeId: number };

let person: Person = { name: "Alice", age: 30 };
let employee: Employee = { name: "Bob", age: 25, employeeId: 123 };

// Employee can be assigned to Person (it has all required properties)
person = employee;
```

**Note:**

It's worth to understand the differences between structural typing, nominal typing, and duck typing:

- Nominal Typing: Used in languages like Java, C#, and Swift, where type compatibility depends on explicit declarations. For example, in the code above, Employee would need to explicitly inherit from Person to be assignable to a person variable.

- Structural Typing: Used in TypeScript or Go, where type compatibility depends on the structure of the types at compile time.

- Duck Typing: Used in languages like Ruby and Python, where type compatibility depends on the behavior of objects at runtime.


**References:**

- https://www.learningtypescript.com/articles
- https://exploringjs.com/tackling-ts/index.html
- https://2ality.com/2025/02/satisfies-operator.html#type-checking-object-property-values
- https://www.typescriptlang.org/docs/handbook/intro.html 