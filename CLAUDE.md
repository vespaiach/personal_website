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

### Command → component dispatch

Typing a command doesn't render a template string — it resolves the target
against the virtual filesystem above and hands off to the Alpine
store/component that already owns that content type:

- `ls` → a directory-listing view populated from the resolved directory's
  entries (shares styling with today's `postList`/`topicList` row markup).
- `cat <post-slug>` → `Alpine.store('reader')` (`postReader.ts`): fetch
  `content/posts/<slug>.md`, split frontmatter/body with `lib/markdown.ts`,
  tokenize any code blocks with `lib/highlight.ts`.
- `cat me.md` / `cat stack.json` / `cat projects/<slug>.md` → `aboutPage.ts`,
  fetching the one requested file instead of returning its hardcoded fields.
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
- `lib/markdown.ts`, `lib/highlight.ts`, `lib/format.ts` are stubs — `cat`'s
  rendering depends on all three.
- `postList.ts`, `topicList.ts`, `aboutPage.ts`, `postReader.ts` all return
  hardcoded dummy data today; wiring `ls`/`cat` means replacing that with the
  `import.meta.glob` + frontmatter parsing described above.
- `package.json` still carries dependencies/scripts from the previous
  Nunjucks/Tailwind-CLI/`gray-matter` build (`tailwindcss`, `marked`,
  `nunjucks`, `gray-matter`, `http-server`, `date-fns`, `async-mutex`)
  alongside the new Vite/Alpine stack. Unrelated to the shell architecture,
  but worth pruning before content wiring lands.
