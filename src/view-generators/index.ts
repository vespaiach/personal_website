import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderJsonView, renderMarkdownView } from "../lib/markedFragment.ts";
import {
  assertNoVirtualPathCollisions,
  collectFileSources,
  collectFolderSources,
  type Source,
} from "./collect.ts";
import { renderListingView } from "./renderListingView.ts";
import { renderTreeView } from "./renderTreeView.ts";

function commandFor(source: Source): string {
  return source.type === "folder" ? "ls" : "cat";
}

async function renderSource(source: Source): Promise<string> {
  if (source.type === "folder") return renderListingView(source.virtualPath, source.entries);

  const raw = readFileSync(source.filePath, "utf-8");
  const eyebrow = `~${source.virtualPath}`;
  return source.kind === "json" ? await renderJsonView(raw, eyebrow) : await renderMarkdownView(raw, eyebrow);
}

export async function generateViews(root: string): Promise<Record<string, string>> {
  const contentDir = join(root, "content");
  const folderSources = collectFolderSources(contentDir);
  const sources: Source[] = [...collectFileSources(contentDir), ...folderSources];
  assertNoVirtualPathCollisions(sources);

  const outputDir = join(root, "dist", "generated");
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const manifest: Record<string, string> = {};

  for (const source of sources) {
    const html = await renderSource(source);
    const fileName = `${randomUUID()}.html`;
    writeFileSync(join(outputDir, fileName), html);
    manifest[`${commandFor(source)} ${source.virtualPath}`] = `/generated/${fileName}`;
  }

  const treeHtml = renderTreeView(folderSources);
  const treeFileName = `${randomUUID()}.html`;
  writeFileSync(join(outputDir, treeFileName), treeHtml);
  manifest["tree /"] = `/generated/${treeFileName}`;

  const sortedManifest = Object.fromEntries(
    Object.entries(manifest).sort(([left], [right]) => left.localeCompare(right)),
  );
  const srcDir = join(root, "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "manifest.json"), `${JSON.stringify(sortedManifest, null, 2)}\n`);

  return sortedManifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateViews(process.cwd());
}