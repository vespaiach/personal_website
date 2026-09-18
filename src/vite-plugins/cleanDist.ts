import { readdirSync, rmSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

const KEEP = new Set(["generated"]);

export default function cleanDist(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "clean-dist",
    apply: "build",
    config() {
      return { build: { emptyOutDir: false } };
    },
    configResolved(config) {
      resolvedConfig = config;
    },
    buildStart() {
      const { outDir } = resolvedConfig.build;
      const { root } = resolvedConfig;
      const outDirPath = isAbsolute(outDir) ? outDir : join(root, outDir);

      let entries: string[];
      try {
        entries = readdirSync(outDirPath);
      } catch {
        return;
      }

      for (const entry of entries) {
        if (KEEP.has(entry)) continue;
        rmSync(join(outDirPath, entry), { recursive: true, force: true });
      }
    },
  };
}