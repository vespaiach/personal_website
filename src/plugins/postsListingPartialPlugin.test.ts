import { describe, expect, it } from "vitest";
import { readPosts } from "./folderListingPlugin.ts";
import { renderPostsListingPartial } from "./postsListingPartialPlugin.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;

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