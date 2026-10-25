---
description: My personal blog and portfolio, built as a terminal. Fully static, pre-rendered for search engines, and deployed to Cloudflare Workers.
---

# vespaiach.com

[vespaiach.com](https://vespaiach.com/) · **Role:** Built + maintain · **Platform:** Vite, TypeScript

My personal blog and portfolio site.

## What I did

I wanted a personal site that didn't look like a template, and one I fully owned, so I built it as a terminal. Posts, topics, and about pages read like a file explorer, complete with a keyboard command palette for navigation.

Under the hood: Vite and TypeScript for the shell, Alpine.js for the small interactive bits, and plain CSS for styling. Content is Markdown, compiled at build time into static HTML with marked and Shiki, so nothing runs server side. Biome and Vitest keep it clean and tested, and GitHub Actions builds and deploys every push to Cloudflare Workers. The result is a fast, fully static site with no server and no database. Publishing is just a Markdown file and a push.

## The problem I solved

A terminal UI that renders views with JavaScript is hard for search engines to crawl. So the build also pre-renders a static page for every view, each with its own title, description, canonical URL, Open Graph tags, and structured data, plus a sitemap. Crawlers get real HTML, and visitors still get the terminal.

**Stack:** TypeScript, Vite, Alpine.js, Markdown, Shiki, Biome, Vitest, GitHub Actions, Cloudflare Workers
