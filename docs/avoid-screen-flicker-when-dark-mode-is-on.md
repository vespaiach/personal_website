---
title: 'Avoid Screen Flicker When Dark Mode Is On'
date: '2022-07-02'
excerpt: 'Storing user’s dark-mode preference in browsers and updating stylesheet/css accordingly wherever users change the preference seems to be the easiest way to support dark-mode on the sites, but actually that implementation will introduce an issue - the screen flicker - which may annoy users sometimes. So, in this post, I will show you how I fix the screen flicker issue for my website.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/hydration-failed-react-encoder-error.md
tags: nextjs,dark mode,screen flicker,theme mode
---

## Screen flicker

Here was what my website looked like before (I used NextJS and Static Generation features to build my website).

[vespaiach.com](https://www.vespaiach.com/images/vespaiach_flashing.gif)

If you look at the `<html>` tag, you will see its class attribute change after page refreshing. That was because I instructed the web page to read dark-mode preference from local storage and updated the class attribute accordingly after browsers had rendered the page. So, the flow of updating theme site was:

1. Server returned HTML pages which were pre-rendered in light-mode
2. HTML pages read dark-mode preference from localstorage
3. Update `<html>` class attribute with correct theme mode (dark/ light)

Obviously, in this flow, pages were displayed in light-mode at first, and jumped to dark-mode later, and that was what the flicker happened.

## How to prevent the screen flicker

What if we send servers the dark-mode preference beforehand and let servers pre-render HTML with correct mode before sending it back to browsers? To achieve that, I decided to store dark-mode preference in cookies and because cookies were enclosed to requests to the server, servers would receive that information at runtime.

Well, that fixed the problem, but brought me another issue. My website was just HTML pages, so I leveraged the Static Generation features of NextJS to generate my websites at build time and didn’t use Server Rendering features to pre-render websites at server runtime. So servers receiving dark-mode reference cookies at runtime were meaningless!

To fix it, I instructed NextJS to generate HTML pages for both light-mode and dark-mode at build time and used the dark-mode preference cookies as a router to HTML pages with correct theme modes. So the flow of updating theme site became:

1. Server built HTML pages for both light-mode and dark-mode at build time
2. Browser sent requests with dark-mode cookies enclosed
3. Server read dark-mode cookies and decided which HTML pages would be returned
4. Browser got correct theme mode versions of HTML pages

## How to implement them in NextJS

To instruct NextJS to pre-render HTML for light-mode and dark-mode in build time, I returned double paths of a HTML page in the `getStaticPaths` function. For instance:

```js
// let say, I have an article with name path: 'article-name'
export async function getStaticPaths() {
    return {
        paths: [
            { params: { name: 'article-name----light-mode' } },
            { params: { name: 'article-name----dark-mode' } },
        ],
        fallback: true,
    };
}
```

NextJS has a file-system based router, that means it generates website URLs based on how we create and name files/folders. So What I was doing here was to order NextJS to generate two HTML pages with two different URLs (one for light-mode/ another for dark-mode). Clearly, this wasn’t what I wanted, because now I got back two different URLs. So to deal with that, I created a middleware to read the requesting URL plus dark-mode preference cookies, then rewrote the request to the correct HTML page. For instance, a request URL `/posts/article-one` with dark-mode cookie on was rewritten to `/post/article-one----dark-mode`

```js
export function middleware(request: NextRequest) {
    const mode = .....; // read request's cookies for the mode
    if (request.nextUrl.pathname === '/posts/article-one') {
        return NextResponse.rewrite(new URL(`/posts/article-one----${mode}`, request.url));
    }
}
```

These are two important steps that help my idea work. For more detail on how to implement it on my website, please check out the source code from [this link](https://github.com/vespaiach/personal_website).
