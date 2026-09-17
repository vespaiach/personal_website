import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { collectFileSources, collectFolderSources } from "./collect.ts";
import { generateViews } from "./index.ts";

const CONTENT_DIR = new URL("../../../content", import.meta.url).pathname;
const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "generate-views-"));
  symlinkSync(CONTENT_DIR, join(root, "content"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("generateViews", () => {
  it("writes uuid-named fragments to dist/generated and a matching src/manifest.json", async () => {
    const root = createRoot();

    const manifest = await generateViews(root);

    const contentDir = join(root, "content");
    const sourceCount = collectFileSources(contentDir).length + collectFolderSources(contentDir).length;
    expect(Object.keys(manifest)).toHaveLength(sourceCount);
    expect(Object.keys(manifest)).toEqual(
      expect.arrayContaining(["/", "/posts", "/about", "/about/projects", "/topics"]),
    );

    const uuidPathPattern = /^\/generated\/[0-9a-f-]{36}\.html$/;
    for (const value of Object.values(manifest)) {
      expect(value).toMatch(uuidPathPattern);
    }

    const manifestOnDisk = JSON.parse(readFileSync(join(root, "src", "manifest.json"), "utf-8"));
    expect(manifestOnDisk).toEqual(manifest);

    const postFileName = manifest["/posts/typescript-notes.md"].replace("/generated/", "");
    const postPath = join(root, "dist", "generated", postFileName);
    expect(existsSync(postPath)).toBe(true);
    const postContent = readFileSync(postPath, "utf-8");
    expect(postContent).toContain("<article");
    expect(postContent).toContain("~/posts/typescript-notes.md");

    const postsListingFileName = manifest["/posts"].replace("/generated/", "");
    const postsListingContent = readFileSync(join(root, "dist", "generated", postsListingFileName), "utf-8");
    expect(postsListingContent).toContain("typescript-notes.md");
    expect(postsListingContent).toContain("-rw-r--r--");
  });

  it("clears stale files from a previous run instead of accumulating them", async () => {
    const root = createRoot();

    await generateViews(root);
    const outputDir = join(root, "dist", "generated");
    const firstRunFiles = readdirSync(outputDir);

    const secondManifest = await generateViews(root);
    const secondRunFiles = readdirSync(outputDir);

    expect(secondRunFiles).toHaveLength(firstRunFiles.length);
    expect(secondRunFiles.every((f) => Object.values(secondManifest).includes(`/generated/${f}`))).toBe(true);
  });
});