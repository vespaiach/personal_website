# personal_website

Trinh Nguyen's personal site (`vespaiach`) — a terminal-styled dev blog. Being rebuilt with Vite + Alpine.js, replacing an old React/design-canvas export. Stack: Vite 8, TypeScript, Alpine.js 3, Tailwind CSS 4, Biome (lint + format).

## Core Coding Principles

- **Prefer the simple solution over the complex or abstract one.** Don't introduce a pattern, layer, or generalization the current requirement doesn't need.
- **No dead or unused code.** Remove functions, variables, imports, and files that nothing references — don't leave them "just in case."
- **No inline code comments.** Write code whose names and structure make its purpose obvious instead of explaining it in a comment.

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
│   ├── posts/*.md                 10 real posts (frontmatter: title, date, updatedAt, excerpt, github, tags)
│   └── about/
│       ├── me.md                  placeholder bio
│       ├── stack.json             { languages[], frameworks[] }
│       └── projects/*.md          one file per project (currently placeholder bodies)
├── public/fonts/          7 self-hosted woff2 files (Latin subset only — trimmed from the
│                          original's 19, which also covered cyrillic/greek/vietnamese)
└── src/
    ├── alpine.d.ts              ambient shim — alpinejs ships no TS types of its own
    ├── main.ts                  Alpine.start(), registers every component below
    ├── styles/global.css      Tailwind CSS 4 entry point (`@import "tailwindcss"`) plus the
    │                          rest of the design system ported from Vespaiach Terminal.html —
    │                          fonts, colors, typography, spacing, shape, elevation,
    │                          motion, base defaults, all in one file
    ├── CommandParser.ts         real, tested: splits a raw input line on `&` into
    │                          `{command, arg}` pairs and validates each against the
    │                          supported-command/arg-shape rules — not wired to
    │                          command-palette.ts yet (see Gaps below)
    ├── lib/
    │   ├── path.ts              real, tested: resolves relative/absolute virtual-fs
    │   │                        paths (`toAbsolutePath`) and lists every path that
    │   │                        exists under content/ (`getAvailablePaths`)
    │   └── {markdown.ts, highlight.ts, format.ts}    stub functions, all TODO
    └── components/
        ├── header.ts            ⌘K listener (active-page state now lives in partials/header.html)
        ├── command-palette.ts    Alpine.store('palette') — open/close only, no search yet
        ├── postList.ts          Alpine.data('postList') — 2 dummy posts
        ├── postReader.ts        Alpine.store('reader') — dummy inline post view
        ├── topicList.ts         Alpine.data('topicList') — 2 dummy topics
        └── aboutPage.ts         Alpine.data('aboutPage') — dummy bio/stack/projects
```

`npm run build` (`tsc && vite build`), `npm test` (`vitest run`), and `npm run lint` (`biome check`) are all clean as of 2026-09-12.

**Before committing any code change**, run `npm run lint`, `npm test`, and `npm run build` — all three must pass.

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
  discovered by the codegen plugin at build time (see below), filename
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
| `ls [path]` | Fetches the generated listing component for `path` (default: cwd) and renders it inline in the terminal's output log (see below). |
| `cat <file>` | Fetches the generated component for one file and renders it inline in the terminal's output log (see below). |
| `cd <dir>` | Changes cwd. A top-level target (`/`, `posts`, `topics`, `about`) is a real page navigation, since each is its own route with no shared router. A target relative to the current page (e.g. `cd projects` while on `/about/`) only updates cwd in place. |
| `help` | Prints the command list, plus the current directory's own listing as a hint. |
| `clear` | Empties the output log. Does not touch cwd. |
| `tree [path]` | Recognized by `CommandParser.ts` (optional arg, like `ls`), but its rendered behavior isn't designed or implemented yet. |

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

The same plugin also generates one **listing** component per virtual folder —
these render `ls`, the way the per-file components above render `cat`:

- `public/components/posts-listings.html` — every post's title/date/excerpt,
  generated from all of `content/posts/*.md`'s frontmatter.
- `public/components/topics-listings.html` — every derived tag (see
  "The virtual filesystem" above) with its post count.
- `public/components/about-listings.html` — the fixed `about/` entries
  (`me.md`, `stack.json`, `projects/`).
- `public/components/projects-listings.html` — every project file's name,
  generated from all of `content/about/projects/*.md`.
- The `-listings` suffix keeps this namespace distinct from the per-file one
  above, so a source file literally named `posts.md` (→ `posts.html`) can't
  collide with `posts-listings.html`.

### Command → component dispatch

Typing a command resolves the target against the virtual filesystem above and
hands off to the Alpine store/component that already owns that content type:

- `ls <path>` (e.g. `ls /posts`, `ls projects` from `/about/`) → resolve
  `<path>` to one of `posts`/`topics`/`about`/`projects`, `fetch()` the
  matching `/components/<folder>-listings.html`, insert it into the output
  log, and `Alpine.initTree()` it — same mount step as `cat`, just against
  the listing namespace instead of the per-file one.
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

- `command-palette.ts` is currently a ⌘K modal (open/close only). `CommandParser.ts`
  and `lib/path.ts` already implement the parsing/path-resolution pieces
  described above, but neither is wired into `command-palette.ts` or the
  dispatch flow yet, and reconciling "modal palette" vs. "always-visible
  inline terminal" is an open UI decision.
- The `public/components/` codegen Vite plugin described above doesn't exist
  yet — it's the next concrete build task.
- `lib/markdown.ts`, `lib/highlight.ts`, `lib/format.ts` are stubs today.
  Once the codegen plugin lands, they're called from that plugin at build
  time (Node), not from browser code — `postReader.ts`'s current shape
  (fetch raw `.md`, parse client-side) is the wrong end-state and should be
  replaced by the fetch-generated-HTML-and-mount flow above.
- `postList.ts`, `topicList.ts`, `aboutPage.ts` still return hardcoded dummy
  data. With listings also moving to generated components, wiring `ls` means
  replacing that dummy data with the fetch-and-mount flow above, not with
  `import.meta.glob` reads in the browser — codegen now owns both the
  per-file and the per-folder rendering, and the browser only fetches.
