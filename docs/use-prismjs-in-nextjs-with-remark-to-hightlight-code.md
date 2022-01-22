---
title: 'Use PrismJS with Remark to hightlight code'
date: '2022-01-15'
excerpt: "When I first tried to adopt PrismJS to hightlight code examples for my websites, I spent a lot of time to investigate why it didn't work for me. And that was so paintful for adopting just a small of code...😞"
github: https://github.com/vespaiach/personal_website/blob/main/docs/use-prismjs-in-nextjs-with-remark-to-hightlight-code.md
tags: prismjs,remark
---

Honestly, I didn't read the documentation of all plugins which are used alone with Remark to produce code highlights. And I had paid for it my whole day of debugging. 

Here is the code of how to use them:

```javascript
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';

const markdownContent = `\n#Hello\n\nThis is me\n`;

// Note: sanitize is set to false 
// in order to allow inserting class attribute
const result = await remark()
                .use(html, { sanitize: false })
                .use(prism)
                .process(markdownContent);
```

First, we need `remark` for sure, then we need `remark-html` to transform markdown to html, finally the plugin `remark-prism` will help to highlight code examples by wrapping code examples into html tags: `<pre>` or `<code>` and insert appropriately class attributes into those tags.

```javascript
/*
 * Remark and PrismJS will convert our markdown code to HTML
 * 
 *```javascript
 *  const a = 1;
 *  console.log(a);
 *```
 * 
 * to
 * 
 * <pre class="lang-javascript">
 * const a = 1;
 * console.log(a);
 * </pre>
 *
 */
```

We also need to download [prism.css](https://prismjs.com/) file to make the code work.

One important thing to note here is `remark-html` from version `14.0.1` has marked the sanitize option to be true by default. That means it will strip off all unsafe html codes, and in this case are the `class` attributes, but `remark-prism` is reliant on that to work.

With the option `sanitize: false`, the code highlight should work fine.


