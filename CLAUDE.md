# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Trinh Nguyen's personal site (`vespaiach`) — a terminal-styled dev blog. Stack: Vite 8, TypeScript, Alpine.js 3, plain CSS, Biome (lint + format), Vitest. Requires Node 22+.

## Core Coding Principles

- **Prefer the simple solution over the complex or abstract one.** Don't introduce a pattern, layer, or generalization the current requirement doesn't need.
- **No dead or unused code.** Remove functions, variables, imports, and files that nothing references — don't leave them "just in case."
- **No inline code comments.** Write code whose names and structure make its purpose obvious instead of explaining it in a comment.

**Before committing any code change**, run `npm run lint`, `npm test`, and `npm run build` — all three must pass.

## Commands

```bash
npm run build          # gen:views → tsc → vite build (output in dist/)
npm run preview        # serve dist/ — the only way to see real posts/pages
npm run gen:views      # regenerate dist/generated/ and src/manifest.json only
npm test               # vitest run (all tests)
npx vitest run src/commands/LsCommand.test.ts   # one test file
npx vitest run -t "returns an error"            # tests matching a name
npm run lint           # biome check (lint + format + import order)
npm run lint:fix       # biome check --write
```

`npm run dev` is currently broken: its `predev` hook calls `gen:content-views`, which doesn't exist (the script is `gen:views`). Even when fixed, generated views live in `dist/generated/`, so the dev server can't serve them — use `build` + `preview` to see content.

## Architecture

The site is a static "shell" over a virtual filesystem. There is one real page (`index.html`); `about/index.html` and `topics/index.html` are stale leftovers (not in the Vite `input`, and they reference an unregistered `shell` component).

**Build-time content pipeline** (`src/view-generators/`, run by `gen:views` via `node src/view-generators/index.ts`):
- `collect.ts` maps `content/` onto virtual paths: `content/posts/*.md` → `/posts/*`, `content/about/*` → `/about/*`, and `/topics/<tag>` folders derived from each post's `tags` front matter (no files of their own). Colliding virtual paths throw.
- Each source is rendered to an HTML fragment (markdown via `marked`, code via `shiki`, resume via `renderResumeView.ts`, JSON via `renderJsonView`) and written to `dist/generated/<uuid>.html`.
- A manifest keyed by the command string (`"cat /posts/x.md"`, `"ls /topics"`, `"tree /about"`) → fragment URL is written to `src/manifest.json` (gitignored). `src/main.ts` imports it, so it must exist before `tsc` or the bundle runs — `prebuild` guarantees that.
- `src/vite-plugins/cleanDist.ts` empties `dist/` on build but keeps `generated/`, since `gen:views` writes there before Vite runs.
- These files run directly under Node's type stripping: import with explicit `.ts` extensions and use only erasable TypeScript syntax (`erasableSyntaxOnly`).

**Runtime** (browser):
- `commands/` — one class per shell command extending `Command` (private constructor + static `init`, static `syntax`/`description`, `argRule`). `Command.resolvePath()` resolves the argument against `cwd`, then looks the `"<name> <absolutePath>"` key up in the manifest; commands `fetch` the fragment and return a `CommandResult`. Register new commands in `commandClasses` in `commands/index.ts`.
- `components/` — Alpine components registered in `main.ts`. Each submitted prompt is pushed onto `$store.prompts`; a `commandLine` component per prompt types it out, then runs `parseCommand` (splits `&&` chains) and `execute` sequentially, threading `cwd` through results. `clear` empties the prompts store and re-queues any chained commands after it.
- Global state lives in Alpine stores (`prompts`, `cwd`, `activeLink`, `manifest`) declared in `main.ts`; their types and `CommandResult`/`PathResult` are ambient declarations in `src/alpine.d.ts`. Extend both places when adding a store.
- `partials/*.html` are injected into `index.html` at build time via `<load src="…" />` (`vite-plugin-html-inject`); Alpine markup in them can call methods of enclosing `x-data` scopes.
- `lib/` holds framework-free helpers (path resolution, command parsing/suggestions, markdown, formatting, highlighting).

## Testing and lint conventions

- Tests sit beside their source as `*.test.ts`. Command and component tests stub `alpinejs` (`vi.mock("alpinejs", …)`) and `MutationObserver` before dynamically importing the module under test — copy the setup from `src/commands/index.test.ts`.
- Biome only checks `src/**`; formatting is 2-space indent, double quotes, 110-column lines, no trailing newline.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml` (`npm ci`, `npm test`, `npm run build`, publish `dist/` to GitHub Pages; custom domain in `public/CNAME`). CI does not run lint.
