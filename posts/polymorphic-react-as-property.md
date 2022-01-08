---
title: "Polymorphic React `as` property"
date: "2022-01-08"
excerpt: "This is my very first post here, in my personal website, and as usual, shouldn't I talk a bit about myself or so...! Well, let's put that aside because I can't wait to share with you about the magic React `as` property which took almost two days to research it."
github: https://github.com/vespaiach/personal_website/blob/main/posts/polymorphic-react-as-property.md
tags: react,polymorphic react
---

This is my very first post here, in my personal website, and as usual, shouldn't I talk a bit about myself or so...! Well, let's put that aside because I can't wait to share with you about the magic React `as` property which took almost two days to research it.

In short, the `as` prop let us pass a component which will be rendered inside another component, and that should be an easy goal to achieve. Something likes below code just be enough to make it work.

```jsx

function Poly({ as: Component = 'div', ...rest }) {
  return <Component {...rest} />
}

```

The example is writing in JSX, but how we rewriting it using TSX (Typescript).

In fact, the project I am currently working on is writing with JSX and there are a lot of Polymorphic components which are designed to use `as` property together with `forwardRef`. However, they didn't working expectedly, when passing a component into `as` property, editor didn't recognize property types of that component or it understood them as type of any. So, I digged into code of Chakra UI and Material UI to see how they design the `as` property, and honestly, what I found was a lot of magic Typescript codes which were realy hard to understand. Thanks to [Typescript Playground](https://www.typescriptlang.org/play?), I copied all the code to there and was abled to fix problems.


