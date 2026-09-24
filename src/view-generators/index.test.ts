import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { collectFileSources, collectFolderSources } from "./collect.ts";
import { generateViews } from "./index.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;
const INDEX_HTML = new URL("../../index.html", import.meta.url).pathname;
const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "generate-views-"));
  symlinkSync(CONTENT_DIR, join(root, "content"));
  symlinkSync(INDEX_HTML, join(root, "index.html"));
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
    expect(resumeContent).not.toContain('<article class="content-view">');
    expect(resumeContent).toContain("source: <a");
  });

  it("writes a full page for every cat and ls view, with the posts listing as the home page", async () => {
    const root = createRoot();

    await generateViews(root);

    const pagesDir = join(root, "pages");
    const aboutMe = readFileSync(join(pagesDir, "about", "me.html"), "utf-8");
    expect(aboutMe).toContain("<title>About Me - vespaiach.com</title>");
    expect(aboutMe).toContain('<link rel="canonical" href="https://vespaiach.com/about/me.html" />');
    expect(aboutMe).toContain('active="about"');
    expect(aboutMe).toContain('<span class="command-line__command">cat /about/me.md</span>');
    expect(aboutMe).toContain('<article class="content-view">');

    const post = readFileSync(join(pagesDir, "posts", "typescript-notes.html"), "utf-8");
    expect(post).toContain("<title>Typescript Notes - vespaiach.com</title>");
    expect(post).toContain('<meta name="description" content="Discover essential TypeScript concepts');
    expect(post).toContain('active="posts"');
    expect(post).toContain('<meta property="og:type" content="article" />');
    expect(post).toContain('"@type":"BlogPosting"');

    const topic = readFileSync(join(pagesDir, "topics", "javascript", "index.html"), "utf-8");
    expect(topic).toContain("<title>Posts about javascript - vespaiach.com</title>");
    expect(topic).toContain('active="topics"');
    expect(topic).toContain('<article class="ls-view">');

    const home = readFileSync(join(pagesDir, "index.html"), "utf-8");
    expect(home).toContain("<title>Trinh Nguyen&#39;s Web Development Blog - vespaiach.com</title>");
    expect(home).toContain('<link rel="canonical" href="https://vespaiach.com/" />');
    expect(home).toContain('<span class="command-line__command">ls /posts</span>');
    expect(home).toContain("typescript-notes.md");

    const posts = readFileSync(join(pagesDir, "posts", "index.html"), "utf-8");
    expect(posts).toContain('<link rel="canonical" href="https://vespaiach.com/" />');

    const pageFiles = readdirSync(pagesDir, { recursive: true, encoding: "utf-8" }).filter((file) =>
      file.endsWith(".html"),
    );
    const contentDir = join(root, "content");
    expect(pageFiles).toHaveLength(
      collectFileSources(contentDir).length + collectFolderSources(contentDir).length,
    );
    expect(pageFiles.some((file) => file.endsWith("tree.html"))).toBe(false);
  });

  it("lists every page but the home page's duplicate in public/sitemap.xml", async () => {
    const root = createRoot();

    await generateViews(root);

    const sitemap = readFileSync(join(root, "public", "sitemap.xml"), "utf-8");
    const pageFiles = readdirSync(join(root, "pages"), { recursive: true, encoding: "utf-8" }).filter(
      (file) => file.endsWith(".html"),
    );
    expect(sitemap.match(/<loc>/g)).toHaveLength(pageFiles.length - 1);
    expect(sitemap).not.toContain("<loc>https://vespaiach.com/posts/</loc>");
    expect(sitemap).toContain("<loc>https://vespaiach.com/</loc>");
    expect(sitemap).toContain("<loc>https://vespaiach.com/about/</loc>");
    expect(sitemap).toContain(
      "<loc>https://vespaiach.com/posts/typescript-notes.html</loc><lastmod>2025-03-23</lastmod>",
    );
    expect(sitemap).not.toContain("tree");
  });

  it("clears stale pages from a previous run", async () => {
    const root = createRoot();

    await generateViews(root);
    const stalePage = join(root, "pages", "stale.html");
    writeFileSync(stalePage, "stale");

    await generateViews(root);

    expect(existsSync(stalePage)).toBe(false);
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