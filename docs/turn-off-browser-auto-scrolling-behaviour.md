---
title: Turn off browser's auto-scrolling behavior
date: 2022-02-08T16:21:21.000-0500
excerpt: Automatically restoring the last scrolling position usually offers great users' experiences while users navigate out of a page by clicking on a link on that page and later on they come back to the previous page. Browsers, by default, memorize the last position on the page where users left off and automatically jump to that position so that users don’t have to scroll back and forth to find it.
github: https://github.com/vespaiach/personal_website/blob/main/docs/turn-off-browser-auto-scrolling-behaviour.md
tags: javascript,dom
---

Sometimes that behavior of browsers doesn’t provide the great experiences as it is supposed to be. In my case, when I made a landing page for a client's website. There is a marketing video at the top of the page, and clients wanted it to always play and show at the first look every time users visit or just refresh the landing page. However, the default browser’s behavior just kept restoring the last position of the page and it gave clients the feeling of browser’s jumping.

Luckily, most modern browsers give developers a way to turn off that behavior and let them control it manually by simply setting `history.scrollRestoration = 'manual'`. For browsers don't support scroll behavior, developers can use below code to fallback to `window.scrollTo` function

```javascript
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
} else {
  /**
   * Use onbeforeunload event to prevent page jumping when refreshing
   */
  window.onbeforeunload = () => {
    window.scrollTo(0, 0);
  };
}
```
