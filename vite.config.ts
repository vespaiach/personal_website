import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Multi-page build: Posts (root), Topics, About.
// Shared nav lives in partials/header.html — not yet injected into these
// entries at build time (TODO: transformIndexHtml plugin or similar).
// Each page inlines its own copy of the header markup for now.
const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        topics: `${root}topics/index.html`,
        about: `${root}about/index.html`,
      },
    },
  },
});
