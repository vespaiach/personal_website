---
title: 'Supercharging WordPress Block Styles with Additional CSS Enhancement'
date: '2026-10-01T12:00:00.000Z'
updatedAt: '2026-10-01T12:00:00.000Z'
excerpt: "WordPress built-in block Additional CSS is simple and useful for small style changes, but it is limited when a block needs more flexible styling."
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/supercharging-wordpress-block-styles-with-additional-css-enhancement.md
tags: wordpress, wp-plugin 
---

So, I built [Additional CSS Enhancement](https://github.com/vespaiach/additional-css-enhancement-plugin) to give us a safer, more powerful way to write scoped, block-level CSS directly inside the Block Editor.

## Why I Built It

Instead of cluttering theme stylesheets or writing broad global overrides, **Additional CSS Enhancement** keeps custom styles strictly scoped to the selected block. 

Here is what makes it developer-friendly:
* **Automatic Scoping:** Use the `&` selector to target the current block or its child elements without risking unintended style leakage across the page.
* **Modern CSS Support:** Seamlessly write `@media`, `@supports`, and `@container` wrapper rules directly inside the block sidebar.
* **Safe Compilation & Caching:** Styles are compiled and previewed in the editor, stored with a versioned cache, and validated on the backend before rendering on the frontend—ensuring malformed syntax won't break layout output.

## Supported Core Blocks

Out of the box, the plugin replaces the default custom CSS control for core blocks, including:
* **Text & Content:** Paragraph, Heading, List, Quote
* **Media:** Image, Gallery, Video
* **Layout & Structure:** Cover, Group, Columns, Column, Buttons, Button

## Supported Syntax Example

Writing component-level CSS with pseudo-states and media queries feels clean and native:

```css
/* Base block declarations */
color: #111;
padding: 1.5rem;
border-radius: 8px;

/* Nested hover state */
&:hover {
  color: #005f73;
}

/* Target child elements */
& .wp-block-button__link {
  text-decoration: underline;
}

/* Responsive & conditional rules */
@media (min-width: 768px) {
  padding: 2rem;
}

@container (min-width: 400px) {
  font-size: 1.125rem;
}
```

## Under the Hood & Security

Raw style.css values remain the single source of truth. The frontend only renders compiled CSS if it matches the current raw CSS hash, contains internal selector tokens, and passes PHP template validation. Unsupported at-rules (like @keyframes or @font-face) and un-scoped selectors are safely rejected.

Check out the source code, test suites, or contribute to the project directly on [GitHub](https://github.com/vespaiach/additional-css-enhancement-plugin).