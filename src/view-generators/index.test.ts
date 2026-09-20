import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { collectFileSources, collectFolderSources } from "./collect.ts";
import { generateViews } from "./index.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;
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
    const folderCount = collectFolderSources(contentDir).length;
    const sourceCount = collectFileSources(contentDir).length + folderCount;
    expect(Object.keys(manifest)).toHaveLength(sourceCount + folderCount);
    expect(Object.keys(manifest)).toEqual(
      expect.arrayContaining([
        "ls /",
        "ls /posts",
        "ls /about",
        "ls /about/projects",
        "ls /topics",
        "ls /topics/javascript",
        "tree /",
        "tree /posts",
        "tree /about",
        "tree /about/projects",
        "tree /topics",
        "tree /topics/javascript",
      ]),
    );

    const uuidPathPattern = /^\/generated\/[0-9a-f-]{36}\.html$/;
    for (const value of Object.values(manifest)) {
      expect(value).toMatch(uuidPathPattern);
    }

    const manifestOnDisk = JSON.parse(readFileSync(join(root, "src", "manifest.json"), "utf-8"));
    expect(manifestOnDisk).toEqual(manifest);

    const postFileName = manifest["cat /posts/typescript-notes.md"].replace("/generated/", "");
    const postPath = join(root, "dist", "generated", postFileName);
    expect(existsSync(postPath)).toBe(true);
    const postContent = readFileSync(postPath, "utf-8");
    expect(postContent).toContain("<article");
    expect(postContent).toContain("~/posts/typescript-notes.md");

    const postsListingFileName = manifest["ls /posts"].replace("/generated/", "");
    const postsListingContent = readFileSync(join(root, "dist", "generated", postsListingFileName), "utf-8");
    expect(postsListingContent).toContain("typescript-notes.md");
    expect(postsListingContent).toContain("[f]");

    const topicListingFileName = manifest["ls /topics/javascript"].replace("/generated/", "");
    const topicListingContent = readFileSync(join(root, "dist", "generated", topicListingFileName), "utf-8");
    expect(topicListingContent).toContain("[t]");
    expect(topicListingContent).toContain("discard-after-usages.md");

    const treeFileName = manifest["tree /"].replace("/generated/", "");
    const treeContent = readFileSync(join(root, "dist", "generated", treeFileName), "utf-8");
    expect(treeContent).toContain(">~<");
    expect(treeContent).toContain("about");
    expect(treeContent).toContain("tree-view__name--dir");

    const aboutTreeFileName = manifest["tree /about"].replace("/generated/", "");
    const aboutTreeContent = readFileSync(join(root, "dist", "generated", aboutTreeFileName), "utf-8");
    expect(aboutTreeContent).toContain(">~/about<");
    expect(aboutTreeContent).toContain("projects");
    expect(aboutTreeContent).not.toContain("typescript-notes.md");
  });

  it("renders /about/resume.md with the resume layout instead of the generic markdown view", async () => {
    const root = createRoot();

    const manifest = await generateViews(root);

    const resumeFileName = manifest["cat /about/resume.md"].replace("/generated/", "");
    const resumeContent = readFileSync(join(root, "dist", "generated", resumeFileName), "utf-8");
    expect(resumeContent).toContain('<article class="resume-view">');
    expect(resumeContent).toContain("~/about/resume.md");
    expect(resumeContent).toContain("resume-view__role-entry");
    expect(resumeContent).not.toContain("content-view");
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