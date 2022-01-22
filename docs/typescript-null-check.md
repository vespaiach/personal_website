---
title: 'Typescript checks null/undefined'
date: '2022-01-22'
excerpt: 'I wrote a function that returned string value and possibly null value, but Typescript only recognized the string value and ignored the null value.'
github: https://github.com/vespaiach/personal_website/blob/main/posts/typescript-null-check.md
tags: typescript
---

Let’s examine the code below. I have a function called `getFullname` that accepts a string argument (username) and returns a string value (fullname), and it also can return null if there is no username.

```typescript
const getFullname = (username?: string) => {
  switch (username) {
    case 'nick':
      return 'Nicky Hilton';
    case 'cadc':
      return 'Candy Crush';
    case 'tom':
      return 'Tommy Five';
    default:
      return null;
  }
};
```

Link [playground](https://www.typescriptlang.org/play?strict=false&strictNullChecks=false&ts=4.5.4#code/MYewdgzgLgBA5gUygMQK4Bt1gIYFsEwC8MAFALABQMMqECATjvgPwBcM09AlmHJQJREAfDADelahADuXKMAAWpWgyYJB4qtRjBsdGAHIwXYAGt97eklSMDAOWMmAnjAASXdFHD6A3BK069fR0AE2BzGEsoazADAGFsMGDnWPpaeR8-agCCfU9ccMjogwAVEFxcZ2QuADcEDM1qYIQAM2wMKAsrGzAMdF9NAF9KAe8gA)

Obviously, Typescript should indicate the possible return values are `Nick Hilton`, `Candy Crush`, `Tommy Five` and `null`. However, if `strictNullChecks` option is set to false or ignored (in tsconfig.json), Typescript will remove the null value out of the return value list.

I don’t know why Typescript has that option and when/where it should apply for, but it is mentioned the Typescript’s document [here](https://www.typescriptlang.org/tsconfig#strictNullChecks). So, just give it a look and don’t let’s Typescript surprises us.
