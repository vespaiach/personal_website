import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";

// Multi-page build: Posts (root), Topics, About.
// Shared nav lives in partials/header.html, injected into each entry via
// <load src="partials/header.html" active="..." />.
const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [injectHTML(), tailwindcss()],
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