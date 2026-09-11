# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## personal_website

Trinh Nguyen's personal site (`vespaiach`) — a terminal-styled dev blog. Currently being rebuilt with Vite + Alpine.js + Tailwind CSS, replacing an old React/design-canvas export (the previous site's HTML templates, builders, and markdown docs were deleted in `chore: cleanup old codes`). Stack: Vite 8, TypeScript, Alpine.js 3, Tailwind CSS 4 (via `@tailwindcss/vite`), Biome (lint + format).

## Commands

```bash
npm run dev        # start Vite dev server
npm run build       # tsc type-check, then vite build
npm run preview     # preview the production build
npm run lint         # biome check ./src
npm run lint:fix   # biome check --write ./src (auto-fix + format)
```

There is no test runner configured yet.

## Project Structure

### Current (as of 2026-09-11)

Still the default `npm create vite` TS scaffold, plus `alpinejs` and `@tailwindcss/vite` (added, not wired up yet).

```
personal_website/
├── index.html
├── vite.config.ts        registers @tailwindcss/vite
├── package.json
├── tsconfig.json
├── biome.json
├── public/               empty
└── src/
    ├── main.ts            stock Vite+TS demo (hero/counter/next-steps sections)
    ├── counter.ts         stock counter demo
    ├── style.css
    └── assets/
        ├── hero.png
        ├── typescript.svg
        └── vite.svg
```

### Target (rebuild plan — not yet built)

Three real pages instead of one virtual-filesystem shell. Terminal look/interaction (`ls`-style listings, inline post open) stays; navigation between pages is now real links.

```
personal_website/
├── index.html                  → /            Posts: ls-style listing + inline post reader
├── topics/index.html           → /topics/     tag list, filters the listing inline
├── about/index.html            → /about/      me.md, stack.json, projects
├── partials/header.html         shared nav, injected into all 3 entries at build time
├── content/
│   ├── posts/*.md                real posts, frontmatter intact
│   └── about/{me.md, stack.json, projects.json}
└── src/
    ├── styles/{tokens.css, base.css}      colors / type / spacing / radius / elevation / motion
    ├── lib/{markdown.ts, highlight.ts, format.ts}
    └── components/
        ├── header.ts            active-link state, ⌘K → opens command palette
        ├── commandPalette.ts     cross-page search/jump, topic filter, help
        ├── postList.ts           loads post metadata async, ls-style rows
        ├── postReader.ts         loads + renders one post's body inline on click
        ├── topicList.ts          groups postList's data by tag
        └── aboutPage.ts          loads me.md, stack.json, projects.json
```
