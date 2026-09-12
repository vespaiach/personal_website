# personal_website

Trinh Nguyen's personal site (`vespaiach`) — a terminal-styled dev blog. Being rebuilt with Vite + Alpine.js, replacing an old React/design-canvas export. Stack: Vite 8, TypeScript, Alpine.js 3, Biome (lint + format).

## Project Structure

Scaffolded as of 2026-09-11 — every file exists, but most logic is stub/dummy data (see the `TODO` comment in each file). Nothing here is wired to real content yet.

```
personal_website/
├── index.html                  → /            Posts: ls-style listing + inline post reader
├── topics/index.html           → /topics/     tag list, filters the listing inline
├── about/index.html            → /about/      me.md, stack.json, projects
├── partials/header.html         shared nav, styled — injected into each page via vite-plugin-html-inject
│                          (<load src="partials/header.html" active="posts|topics|about" />)
├── content/
│   ├── posts/*.md                 9 real posts (frontmatter: title, date, updatedAt, excerpt, github, tags)
│   └── about/
│       ├── me.md                  placeholder bio
│       ├── stack.json             { languages[], frameworks[] }
│       └── projects/*.md          one file per project (currently placeholder bodies)
├── public/fonts/          7 self-hosted woff2 files (Latin subset only — trimmed from the
│                          original's 19, which also covered cyrillic/greek/vietnamese)
└── src/
    ├── alpine.d.ts              ambient shim — alpinejs ships no TS types of its own
    ├── main.ts                  Alpine.start(), registers every component below
    ├── styles/global.css      full design system, ported from Vespaiach Terminal.html —
    │                          fonts, colors, typography, spacing, shape, elevation,
    │                          motion, base defaults, all in one file
    ├── lib/{markdown.ts, highlight.ts, format.ts}    stub functions, all TODO
    └── components/
        ├── header.ts            ⌘K listener (active-page state now lives in partials/header.html)
        ├── commandPalette.ts    Alpine.store('palette') — open/close only, no search yet
        ├── postList.ts          Alpine.data('postList') — 2 dummy posts
        ├── postReader.ts        Alpine.store('reader') — dummy inline post view
        ├── topicList.ts         Alpine.data('topicList') — 2 dummy topics
        └── aboutPage.ts         Alpine.data('aboutPage') — dummy bio/stack/projects
```

`tsc --noEmit` is clean. `vite build` / `biome check` weren't verified this round — the verification shell is a Linux sandbox missing rolldown's and biome's Linux-arm64 native binaries (both installed for your Mac's darwin-arm64 only). Run `npm run dev` and `npm run build` locally to confirm.

## Architecture: fake shell over a virtual filesystem

The site presents its content as a Unix-style shell. There is **no client-side
router** — `/`, `/topics/`, `/about/` are three real Vite entries (see
`vite.config.ts`), each rendering its own slice of the virtual filesystem.
Navigating between top-level folders is a real page load; moving around
*within* a page (e.g. into `about/projects/`) is in-page Alpine state.

### The virtual filesystem

```
/
├── posts/            content/posts/*.md            one markdown file per article
├── topics/           (no files on disk)             derived: distinct `tags:` values across every post
└── about/
    ├── me.md         content/about/me.md            bio
    ├── stack.json    content/about/stack.json       { languages: string[], frameworks: string[] }
    └── projects/     content/about/projects/*.md    one markdown file per project
```

- `posts/` and `about/projects/` are the only directories backed by real files —
  discovered at build time with `import.meta.glob('/content/**/*.md')`, filename
  (minus extension) is the slug.
- `topics/` is virtual: it has no files of its own. Its listing is computed by
  splitting every post's frontmatter `tags:` (a comma-separated string, e.g.
  `tags: nginx, lets-encrypt`) and deduping. `cd`-ing into a topic filters the
  posts listing to that tag rather than `cat`-ing anything.
- Post frontmatter fields: `title`, `date`, `updatedAt`, `excerpt`, `github`,
  `tags` (see any file under `content/posts/`).
- A project file's frontmatter/body shape is not yet defined — TODO before
  wiring `cat` for `about/projects/*.md`.

### Supported commands

| Command | Behavior |
|---|---|
| `ls [path]` | Lists entries of `path` (default: cwd). Static children for `/`, `about/`; globbed filenames for `posts/` and `about/projects/`; derived tag names for `topics/`. |
| `cat <file>` | Fetches one file and renders its content inline in the terminal's output log (see below). |
| `cd <dir>` | Changes cwd. A top-level target (`/`, `posts`, `topics`, `about`) is a real page navigation, since each is its own route with no shared router. A target relative to the current page (e.g. `cd projects` while on `/about/`) only updates cwd in place. |
| `help` | Prints the command list, plus the current directory's own listing as a hint. |
| `clear` | Empties the output log. Does not touch cwd. |

### Build-time markdown → component codegen

`cat` never parses markdown in the browser. Instead, every markdown file is
compiled to a ready-to-mount Alpine HTML fragment **at build time**, and `cat`
just fetches the fragment that matches the file's name.

- A custom Vite plugin (not written yet) regenerates a flat, static output
  folder — `public/components/` — from every markdown source under `content/`:
  `content/posts/*.md`, `content/about/me.md`, `content/about/projects/*.md`.
  (`content/about/stack.json` is JSON, not markdown, so it's out of scope for
  this codegen — `aboutPage.ts` still renders it directly.)
- The plugin runs on `buildStart` for `vite build`, and watches `content/` via
  `configureServer` for `vite dev` so editing a `.md` file regenerates its
  component without a restart.
- For each source file the plugin parses frontmatter and body (reusing
  `lib/markdown.ts`'s `parseFrontmatter`/`toBlocks` and `lib/highlight.ts`'s
  `tokenizeCode`, called here in Node at build time rather than in the
  browser), renders one self-contained HTML fragment with the frontmatter and
  body baked directly into the markup, and writes it to
  `public/components/<slug>.html`, where `<slug>` is the source filename
  without its extension — e.g. `content/posts/typescript-notes.md` →
  `public/components/typescript-notes.html`.
- **Flat namespace, one constraint**: because `public/components/` is flat,
  `<slug>` must be unique across `posts/`, `about/` (`me`), and
  `about/projects/` combined — two source files that would generate the same
  `<slug>.html` is a build error, not a silent overwrite.

### Command → component dispatch

Typing a command resolves the target against the virtual filesystem above and
hands off to the Alpine store/component that already owns that content type:

- `ls` → a directory-listing view populated from the resolved directory's
  entries (shares styling with today's `postList`/`topicList` row markup).
- `cat <file>` → strip the extension to get the component name (`cat
  typescript-notes.md` → `typescript-notes`), `fetch()` the matching
  `/components/<name>.html`, insert the returned markup into the terminal's
  output log, then call `Alpine.initTree()` on the inserted node so any
  `x-data`/directives baked into the fragment bind. This is how `me.md` and
  any `projects/<slug>.md` render too. `stack.json` is the one exception —
  not generated, so `aboutPage.ts` renders it straight from the parsed JSON.
- `cd` → updates a shared `Alpine.store('shell')` cwd, then either navigates
  (`window.location`) or re-renders the listing in place.

Each command's rendered result is **appended** to an output-log array on the
shell store, not swapped in — that's what gives `clear` something to empty
and lets the page read like real shell scrollback instead of one static view.

### Gaps between this note and today's code

- `commandPalette.ts` is currently a ⌘K modal (open/close only); it is the
  planned home for command parsing but isn't wired to the dispatch above yet,
  and reconciling "modal palette" vs. "always-visible inline terminal" is an
  open UI decision.
- The `public/components/` codegen Vite plugin described above doesn't exist
  yet — it's the next concrete build task.
- `lib/markdown.ts`, `lib/highlight.ts`, `lib/format.ts` are stubs today.
  Once the codegen plugin lands, they're called from that plugin at build
  time (Node), not from browser code — `postReader.ts`'s current shape
  (fetch raw `.md`, parse client-side) is the wrong end-state and should be
  replaced by the fetch-generated-HTML-and-mount flow above.
- `postList.ts`, `topicList.ts`, `aboutPage.ts` still return hardcoded dummy
  data; wiring `ls` means replacing that with `import.meta.glob` reads of
  `content/` for listings (globbing stays a browser/runtime concern — only
  the per-file `cat` rendering moves to build time).
- `package.json` still carries dependencies/scripts from the previous
  Nunjucks/Tailwind-CLI/`gray-matter` build (`tailwindcss`, `marked`,
  `nunjucks`, `gray-matter`, `http-server`, `date-fns`, `async-mutex`)
  alongside the new Vite/Alpine stack. Unrelated to the shell architecture,
  but worth pruning before content wiring lands.
