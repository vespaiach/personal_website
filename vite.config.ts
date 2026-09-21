import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";
import cleanDist from "./src/vite-plugins/cleanDist.ts";
import flattenPages from "./src/vite-plugins/flattenPages.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const pagesDir = `${root}pages`;
const pages = readdirSync(pagesDir, { recursive: true, encoding: "utf-8" }).filter((file) =>
  file.endsWith(".html"),
);

export default defineConfig({
  plugins: [injectHTML(), cleanDist(), flattenPages()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((file) => [`pages/${file.slice(0, -".html".length)}`, `${pagesDir}/${file}`]),
      ),
    },
  },
});
