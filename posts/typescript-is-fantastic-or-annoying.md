---
title: "Typescript is fantastic or annoying"
date: "2022-01-08"
excerpt: "Typescript is a great tool to help Javascript developers create clean, robust and stable code. However, I found it annoying sometimes, especially when I needed my jobs done fast, but didn't know how to fix TypeError. And that gave me a feeling like I have just headed myself into wall-bricks but didn't break through it 😎"
github: https://github.com/vespaiach/personal_website/blob/main/posts/polymorphic-react-as-property.md
tags: react,polymorphic react
---

Typescript is a great tool to help Javascript developers create clean, robust and stable code. However, I found it annoying sometimes, especially when I needed my jobs done fast, but didn't know how to fix TypeError. And that gave me a feeling like I have just headed myself into wall-bricks but didn't break through it 😎.

I hope you won’t stumble into a wall anyway. Here are some tips about Typescript I’d love to share with you.

## any,  unknown, never

`any` type was added to Typescript first, later on v2 and v3 of Typescript respectively `unknown` type and `never` type were  introduced. Personally, I found their names confused, so don’t read them, here are how I recognize them:

 - When I want my value to be free of type-checking, I will use any
 - When I don’t know exactly the type of my value, and my value can be any possible value: string, number, object… or union types… I will use unknown
 - I use never type in conditional type to narrow results, and it can say like that will never happen (No value can be assignable to variables of never type)

```Typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```



