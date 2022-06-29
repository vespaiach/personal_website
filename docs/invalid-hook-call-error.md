---
title: 'Invalid Hook Call Error'
date: '2022-06-29'
excerpt: '"Invalid hook call. Hook can only be called inside of the body of a function component.". That was what warning message I got back and then an error showed up which wan't hint any clue.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/invalid-hook-call-error.md
tags: reactjs,invalid hook call
---

## The error

I was implementing a React component library - named **calendar-ui**.

Then I created another React app - named **test-calendar** to test that library with help from the `npm link` command. I ran the command `npm link` in the root folder of **calendar-ui** and `npm link calendar-ui` in the root folder of **test-calendar**. After doing it, in the **node_modules** folder there was another **calendar-ui** folder under the **node_modules** folder of **test-calendar**

![Calendar](https://www.vespaiach.com/images/two_projects.png)

When I started the `test-calendar` app, I got these error:

![The error](https://www.vespaiach.com/images/invalid_hook_err.png)

Obviously, the error said I was using React hook in the wrong way, but actually I didn’t. After spending a few hours researching and googling, I found on the official React page, there is [an article](https://reactjs.org/warnings/invalid-hook-call-warning.html) about the exact problem I was facing.

Ultimately, the problem was when running `npm link` it created a symbolic link that pointed to folder **calendar-ui** and noted that I placed the **calendar-ui** folder and the **test-calendar** folder directly under my **dev** folder which said they both have the same level. To be clear here, their node_modules folders had the same level. So when **test-calendar** app started, it used the React instance of **calendar-ui** for the **calendar-ui** component and it caused the mis-match and the error.

## The fix

Basically, We can create another symbolic link of React module inside **calendar-ui** folder that points to React module of **test-calendar**, so that they both use the same React module. However, to make it easy, I simply deleted the **node_modules** folder of **calendar-ui** and everything worked fine.

