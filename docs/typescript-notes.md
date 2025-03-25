---
title: 'Typescript Notes'
date: '2025-03-23'
excerpt: "I love TypeScript, and I find it incredibly helpful in preventing type errors. When refactoring code, TypeScript's type-checking often helps me identify all the areas that break due to updates or deletions I've made elsewhere in the codebase. While this is usually the case for me, there are times when it can be challenging—especially when I encounter complex typing scenarios and struggle to overcome them, getting tripped up by the type-checking. If you've faced similar experiences, feel free to check out these notes about TypeScript."
github: https://github.com/vespaiach/personal_website/blob/main/docs/typescript-notes.md
tags: typescript
---

I love TypeScript, and I find it incredibly helpful in preventing type errors. When refactoring code, TypeScript's type-checking often helps me identify all the areas that break due to updates or deletions I've made elsewhere in the codebase. While this is usually the case for me, there are times when it can be challenging—especially when I encounter complex typing scenarios and struggle to overcome them, getting tripped up by the type-checking. If you've faced similar experiences, feel free to check out these notes to know more about Typescript.

## any

The **any** type is used when you truely don't know the type of values or when you want to bypass TypeScript's type-checking. Essentially, any represents the absence of a specific type.

**When to use:**

- It's best to avoid using any whenever possible. Treat it as a last-resort "escape hatch" from the type system—use it only in scenarios where declaring the type is overly complex or requires excessive effort, or when you need the code to work temporarily and plan to fix it later.

## unknown

The **unknown** type is a type-safe alternative to any. It is considered a "top type" in TypeScript, meaning any value of any type can be assigned to it. However, TypeScript requires you to perform type-checking on an unknown value before you can use it.

**When to use:**

- Use unknown as a safer alternative to any. It ensures that you explicitly verify the type of a value before using it in your code.

## never

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

```
   Top Type (any or unknown)
     / | \
    /  |  \
  Type1 Type2 Type3 ...
   \  |  /
    \ | /
  Bottom Type (never)
```

You can think of a top type as a very large type that can accommodate any other type. In contrast, a bottom type is extremely small, it can fit into other types, but other types cannot fit into a bottom type.
