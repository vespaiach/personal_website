import type { Plugin } from "vite";

const PAGES_PREFIX = "pages/";

export default function flattenPages(): Plugin {
  return {
    name: "flatten-pages",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== "asset" || !fileName.startsWith(PAGES_PREFIX)) continue;
        this.emitFile({
          type: "asset",
          fileName: fileName.slice(PAGES_PREFIX.length),
          source: output.source,
        });
        delete bundle[fileName];
      }
    },
  };
}