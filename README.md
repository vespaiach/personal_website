# vespaiach.com

Trinh Nguyen's personal site: a terminal-styled dev blog. Instead of clicking through pages, you run commands (`ls`, `cat`, `cd`, `tree`) against a virtual filesystem of posts, topics, and an about section.

Live at [vespaiach.com](https://vespaiach.com).

## Stack

- [Vite](https://vite.dev) 8 and TypeScript
- [Alpine.js](https://alpinejs.dev) 3 for the UI
- Plain CSS
- [marked](https://marked.js.org) and [Shiki](https://shiki.style) for Markdown rendering and syntax highlighting
- [Biome](https://biomejs.dev) for linting and formatting
- [Vitest](https://vitest.dev) for tests

## Getting started

Requires Node.js 22 or newer. The view generators run TypeScript directly through Node, with no compile step.

```bash
npm ci
npm run build
npm run preview
```

`build` generates the content views before bundling, and `preview` serves the result. The generated views are only served from the built output, so use `build` then `preview` to see posts and pages.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Generate content views, type-check, and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run gen:views` | Regenerate the content views only |
| `npm test` | Run the Vitest suite |
| `npm run lint` | Check lint and formatting with Biome |
| `npm run lint:fix` | Apply Biome fixes |

Lint, tests, and the build must all pass before committing.

## Using the terminal

The site is a shell. Type a command at the prompt, or press <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> to open the command palette. The header links (`/posts`, `/topics`, `/about`) run `cd` and `ls` for you.

| Command | Description |
| --- | --- |
| `cd [directory_path]` | Change the current directory |
| `ls [file_path]` | List a virtual directory's contents |
| `cat <file_path>` | Print a file's contents |
| `tree [directory_path]` | Show a directory and everything under it as a tree |
| `resume` | Print the resume from anywhere |
| `clear` | Clear the terminal output |
| `help` | List every available command |

Chain commands with `&&`, for example `cd ~/posts && ls`.

## How it works

The site is static. At build time, `src/view-generators/` turns the files in `content/` into HTML fragments and writes them to `dist/generated/` under random UUID names, along with `src/manifest.json`, which maps each command (`cat /posts/typescript-notes.md`, `ls /topics`, `tree /about`) to its fragment. When you run a command in the browser, the app looks it up in the manifest and fetches the matching fragment.

```
content/*.md, *.json
        │  npm run gen:views
        ▼
dist/generated/<uuid>.html  +  src/manifest.json
        │  Vite bundles the app with the manifest
        ▼
browser: command → manifest lookup → fetch fragment → render in terminal
```

For search engines, every `cat` and `ls` view is also written as a full page to `pages/` — `index.html` with the view pre-rendered inside it — so `cat /about/me.md` is served at `/about/me.html` and `ls /about` at `/about/`. The home page pre-renders `ls /posts`. All pages are listed in `public/sitemap.xml`, which `public/robots.txt` points to.

`dist/generated/`, `src/manifest.json`, `pages/` and `public/sitemap.xml` are build output and are gitignored.

## Content

```
content/
├── posts/          one Markdown file per post  →  ~/posts
├── about/
│   ├── me.md
│   ├── resume.md   rendered by the `resume` command
│   ├── stack.json
│   └── projects/   one Markdown file per project
```

`~/topics` is derived from the `tags` of each post; it has no files of its own.

Posts start with front matter:

```markdown
---
title: 'Post title'
date: '2025-03-29T00:00:00.000Z'
updatedAt: '2025-03-29T00:00:00.000Z'
excerpt: 'One-line summary shown in listings'
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/post-slug.md
tags: typescript, notes
---
```

`tags` is a comma-separated list. A tag with spaces becomes a hyphenated topic folder (`syntax highlight` → `syntax-highlight`). The file name is the post's slug.

To add a post, drop a Markdown file in `content/posts/` and rebuild.

## Project layout

```
src/
├── commands/          one class per terminal command, with tests
├── components/        Alpine components (terminal, command line, palette, header, help modal)
├── lib/               command parsing, path resolution, Markdown and highlighting helpers
├── view-generators/   turns content/ into HTML fragments, the manifest, full pages and the sitemap
├── vite-plugins/      cleanDist: clears dist/ between builds but keeps generated/
│                      flattenPages: serves pages/about/me.html at /about/me.html
├── styles/global.css
└── main.ts            registers components and Alpine stores
partials/              HTML partials injected into pages at build time
public/                fonts, CNAME and robots.txt
```

## Deployment

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which runs the tests, builds, and publishes `dist/` to GitHub Pages. The custom domain is set in [`public/CNAME`](public/CNAME).
