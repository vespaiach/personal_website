import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readPosts } from "../lib/utils.ts";
import { generatePostsListing, renderPostsListingPartial } from "./posts-listings.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;
const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "posts-listing-"));
  symlinkSync(CONTENT_DIR, join(root, "content"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("renderPostsListingPartial", () => {
  const posts = readPosts(CONTENT_DIR);
  const html = renderPostsListingPartial(posts);

  it("has no Alpine directives, only plain HTML", () => {
    expect(html).not.toContain("x-data");
    expect(html).not.toContain("x-for");
    expect(html).not.toContain("x-text");
  });

  it("prints the total post count", () => {
    expect(html).toContain("total 10");
  });

  it("renders one row per post with its read time, ls date, and filename", () => {
    expect(html).toContain(">8 min<");
    expect(html).toContain(">Mar 23 2025<");
    expect(html).toContain(">typescript-notes.md<");
  });

  it("lists posts newest first", () => {
    const newest = html.indexOf("setup-staging-site-wordpress-without-builtin-staging.md");
    const oldest = html.indexOf("discard-after-usages.md");
    expect(newest).toBeGreaterThan(-1);
    expect(oldest).toBeGreaterThan(newest);
  });
});

describe("generatePostsListing", () => {
  it("writes the posts listing partial", () => {
    const root = createRoot();

    generatePostsListing(root);

    const outputPath = join(root, "src", "generated", "posts-listing.html");
    expect(existsSync(outputPath)).toBe(true);
    expect(readFileSync(outputPath, "utf-8")).toContain("typescript-notes.md");
  });
});