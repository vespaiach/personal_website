import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [injectHTML()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: `${root}index.html`,
      },
    },
  },
});