---
title: 'PrismJS Loader'
date: '2025-03-29'
updatedAt: '2025-03-29'
excerpt: "Discover Prism.js Loader, and learn how it quickly integrate your webpages with PrismJS-Coding syntax highlight"
github: https://github.com/vespaiach/personal_website/blob/main/docs/prismjs-loader.md
tags: prismjs, syntax highlight
---

Hey there! Are you looking for a quick way to highlight coding syntax on your website? Check out Prism.js Loader. Simply grab the script and place it at the end of your web page, then you're all set! If you're curious about how the script works, keep reading.

## Official Integration Method for PrismJS

Follow these steps to integrate PrismJS officially:

1. Visit the [PrismJS Download page](https://prismjs.com/download.html).
2. Choose the languages you want to highlight on your website.
3. Select the plugins you’d like to include.
4. Pick a theme that suits your site.

After downloading, you’ll receive a JavaScript file and a CSS file. Add them to your site, and you’re done!

## PrismJS Loader: A Smarter Alternative

[PrismJS Loader](https://github.com/vespaiach/prismjs-loader)

One limitation of the official integration is that it bundles all selected languages and plugins into a single JavaScript file, which can slow down page loading. If your webpage only needs to highlight one language, you might still end up loading unnecessary resources.

To solve this problem, PrismJS offers a plugin called Autoloader to only load language package needed for your sites. Building on this idea, I created PrismJS Loader to make the integration process even more easier.

### Features of PrismJS Loader

When the PrismJS Loader script runs on your webpage, it will:
1. Download the theme file (CSS) based on user parameters or use the default theme if no parameters are set.
2. Fetch the Prism core file and the Autoloader plugin.
3. Wait for all scripts to load and then apply coding syntax highlighting.
4. Use the Autoloader plugin to dynamically determine and load only the language packages needed for your webpage.

### Benefits

- PrismJS Loader executes after your webpage has loaded, so it doesn’t impact page performance.
- The script automatically download themes based on the browser’s preferred mode (light or dark) and defaults to the specified theme if no parameter is provided.
- All Prism files are fetched directly from [jsDelivr](https://www.jsdelivr.com/), ensuring reliability.

## Conclusion

PrismJS Loader is the ideal solution for developers who need a quick and efficient way to integrate PrismJS without compromising performance. [Check it out!](https://github.com/vespaiach/prismjs-loader)
 