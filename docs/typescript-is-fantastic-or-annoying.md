---
title: "Typescript is fantastic or annoying"
date: "2022-01-08"
excerpt: "Typescript is a great tool to help Javascript developers create clean, robust and stable code. However, I found it annoying sometimes, especially when I needed my jobs done fast, but didn't know how to fix TypeError. And that gave me a feeling like I have just headed myself into wall-bricks but didn't break through it 😎"
github: https://github.com/vespaiach/personal_website/blob/main/posts/polymorphic-react-as-property.md
tags: react,polymorphic react
---

I hope you won’t stumble into a wall anyway. Here are some tips about Typescript I’d love to share with you.

## Any,  unknown, never

`any` type was added to Typescript first, later on v2 and v3 of Typescript respectively `unknown` type and `never` type were  introduced. Personally, I found their names confused, so don’t read them, here are how I recognize them:

 - When I want my value to be free of type-checking, I will use `any`
 - When I don’t know exactly the type of my value, and my value can be any possible value: string, number, object… or union types… I will use `unknown`
 - I use `never` type in conditional type to narrow results, and it can say like that will never happen (No value can be assignable to variables of never type)

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

## Keyof any

That are `string | number | symbol`

```typescript
type KeyofAny = string | number | symbol;
```

In fact, I use a PropertyType = string | number | symbol instead of keyof any. The reason why we still see keyof any in type declaration files of some libraries is for backward compatible purpose.

## Discriminated type union note

Discriminated type union is great, it helps to show us possible values that we should handle when we come across `if` cases. Example: 

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }

const geometry: Shape;

if (geometry.kind === 'circle') 
/*
 * Editor will show us only possible values of geometry 
 * and that is `radius` in the case.
 * /
```

However, when Discriminated type union won't work with variable destructuring. Something like the code below won't work, and the editor won't show us the exact possible values that we want

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }

const geometry: Shape = { kind: 'circle', radius: 10 };

const { kind, radius } = geometry;

if (kind === 'circle') // editor get confused here
```
This is an knowning issue of current version of Typescript. I hope that will be fixed in next release.





