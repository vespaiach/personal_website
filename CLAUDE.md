# personal_website

Trinh Nguyen's personal site (`vespaiach`) — a terminal-styled dev blog. Being rebuilt with Vite + Alpine.js, replacing an old React/design-canvas export. Stack: Vite 8, TypeScript, Alpine.js 3, plain CSS, Biome (lint + format).

## Core Coding Principles

- **Prefer the simple solution over the complex or abstract one.** Don't introduce a pattern, layer, or generalization the current requirement doesn't need.
- **No dead or unused code.** Remove functions, variables, imports, and files that nothing references — don't leave them "just in case."
- **No inline code comments.** Write code whose names and structure make its purpose obvious instead of explaining it in a comment.

**Before committing any code change**, run `npm run lint`, `npm test`, and `npm run build` — all three must pass.
