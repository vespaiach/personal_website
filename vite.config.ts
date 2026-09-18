import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";
import cleanDist from "./src/vite-plugins/cleanDist.ts";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [injectHTML(), cleanDist()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: `${root}index.html`,
      },
    },
  },
});