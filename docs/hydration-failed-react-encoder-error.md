---
title: 'Hydration failed - React Encoder Error'
date: '2022-06-23'
excerpt: "Sometimes, it’s quite annoying to encounter a hydration failed error in ReactJS but the error is not obvious to figure out. Here are my experiences about how I fixed that error in my web application written by NextJS/ReactJS."
github: https://github.com/vespaiach/personal_website/blob/main/docs/hydration-failed-react-encoder-error.md
tags: javascript,date,nextjs,reactjs
---

## Error description

After adding dark mode support to my website, I deployed it to production and got back these error:

- [https://reactjs.org/docs/error-decoder.html/?invariant=425](https://reactjs.org/docs/error-decoder.html/?invariant=425)
- [https://reactjs.org/docs/error-decoder.html/?invariant=418](https://reactjs.org/docs/error-decoder.html/?invariant=418)

More often, it wouldn’t be difficult to find out the root cause might be that some of my codes had access to DOM while the website was in server-side rendering (SSR) progress. For instance, in my case, there might be a call to `window.localstorage` to get dark mode preference while the app was in SSR, and the result would be the miss-match HTML rendering between server response and client rendering, just because window object was undefined in server-side.

However, it wasn’t the case for me, I had carefully added a check `typeof window === ‘undefined’` before accessing localstorage to make sure the code was run in the browser environment…And it took me quite a while to figure out the root cause of HTML mis-match was in the data that was used to render HTML code in SSR and the data that was sent to the client for rendering.

## The error

In my website, I previously sorted articles by alphabet. Then, I changed to sort them by date, and dates were stored as string, so I converted date strings into Date objects (JS), sorted them, serialized them  and returned them to client-side - note that NextJS does not serialize Date objects for us by default, this library [superjson-next](https://www.npmjs.com/package/babel-plugin-superjson-next) will help to do that. Read [this thread](https://github.com/vercel/next.js/issues/13209#issuecomment-633149650) to see why NextJS fails to serialize Date objects.

The problem came from how browsers parse date string format into Date objects. For example, in data send to client, I have a date string in ISO format `2022-06-20T00:00:00.000Z`, that was date in UTC time, but when my browser parsed that date string, it automatically converted the date into local offset, and for me that was June 19th in Eastern Time.

![Date parsing](https://www.vespaiach.com/images/browser_date_parse.gif)

And here was the mis-match data that caused the hydration error in React-DOM.

![Error 418](https://www.vespaiach.com/images/err_418.png)

## The fix

Since I just want to display dates and don’t care about time, I updated my code to format date string on server-side, on client-side just simply use that string format for displaying, and there was no datetime converting on client-side anymore.

## Lessons Learned

- Despite the fact that the Date object in Javascript is using UTC time to calculate its value, the way browsers parse Date objects always include local timezone and offset.
- In the NodeJS environment, the Date object is always UTC time. When we enter different time zones, NodeJS will convert to UTC time.

