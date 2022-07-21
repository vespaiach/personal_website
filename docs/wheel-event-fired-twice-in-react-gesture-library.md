---
title: 'OnWheel Event Fired Twice In React Gesture Library'
date: '2022-07-22T16:00:00.000-0500'
excerpt: 'When using onwheel events in [@use-gesture/react](https://github.com/pmndrs/use-gesture) library, I was surprised because the event always fired twice even that I just moved the wheel once.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/wheel-event-fired-twice-in-react-gesture-library.md
tags: react gesture, wheel event
---

After diving into the code of handling onwheel events in React Gesture library, I found that was by design and not a bug. For the last onwheel event, the library will fire onwheel event twice with field **active** changing from **true** to **false**. Here is the code of React Gesture's onwheel event handler:

```js
  wheelChange(event) {
    // ... some code here

    this.compute(event);
    this.emit(); // --> fire onwheel event
  }

  wheelEnd() {
    if (!this.state._active) return;
    this.state._active = false; // set active field to false
    this.compute();
    this.emit(); // --> fire the final onwheel event
  }
```

So to prevent the duplication, in my code, I have to check `active=true` before handling other logic.

The **active** field also is mentioned in [React Gesture's document](https://use-gesture.netlify.app/docs/state/#:~:text=active%2C%20%20%20%20%20%20%20%20//%20true%20when%20the%20gesture%20is%20active), but honestly, I had no idea how to use it when I first read the document.
