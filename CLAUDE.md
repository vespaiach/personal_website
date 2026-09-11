# personal_website

Trinh Nguyen's personal site (`vespaiach`) — a terminal-styled dev blog. Being rebuilt with Vite + Alpine.js, replacing an old React/design-canvas export. Stack: Vite 8, TypeScript, Alpine.js 3, Biome (lint + format).

## Project Structure

Scaffolded as of 2026-09-11 — every file exists, but most logic is stub/dummy data (see the `TODO` comment in each file). Nothing here is wired to real content yet.

```
personal_website/
├── index.html                  → /            Posts: ls-style listing + inline post reader
├── topics/index.html           → /topics/     tag list, filters the listing inline
├── about/index.html            → /about/      me.md, stack.json, projects
├── partials/header.html         shared nav — NOT injected into the build yet, each page inlines its own copy
├── content/
│   ├── posts/*.md                2 dummy posts — replace with the real 10
│   └── about/{me.md, stack.json, projects.json}   all placeholder content
└── src/
    ├── alpine.d.ts              ambient shim — alpinejs ships no TS types of its own
    ├── main.ts                  Alpine.start(), registers every component below
    ├── styles/{tokens.css, base.css}      real Nord tokens, compact subset (no self-hosted fonts yet)
    ├── lib/{markdown.ts, highlight.ts, format.ts}    stub functions, all TODO
    └── components/
        ├── header.ts            ⌘K listener + active-page label
        ├── commandPalette.ts    Alpine.store('palette') — open/close only, no search yet
        ├── postList.ts          Alpine.data('postList') — 2 dummy posts
        ├── postReader.ts        Alpine.store('reader') — dummy inline post view
        ├── topicList.ts         Alpine.data('topicList') — 2 dummy topics
        └── aboutPage.ts         Alpine.data('aboutPage') — dummy bio/stack/projects
```

`tsc --noEmit` is clean. `vite build` / `biome check` weren't verified this round — the verification shell is a Linux sandbox missing rolldown's and biome's Linux-arm64 native binaries (both installed for your Mac's darwin-arm64 only). Run `npm run dev` and `npm run build` locally to confirm.
