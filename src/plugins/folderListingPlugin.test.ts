import { describe, expect, it } from "vitest";
import { deriveTopics, readPosts, readProjectSlugs } from "./folderListingPlugin.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;

describe("readPosts", () => {
  const posts = readPosts(CONTENT_DIR);

  it("reads every post under content/posts", () => {
    expect(posts).toHaveLength(10);
  });

  it("parses frontmatter into title/date/excerpt/tags", () => {
    const post = posts.find((p) => p.slug === "typescript-notes");
    expect(post).toMatchObject({
      title: "Typescript Notes",
      date: "2025-03-23T00:00:00.000Z",
      readTime: "8 min",
      lsDate: "Mar 23 2025",
    });
    expect(post?.excerpt).toContain("TypeScript");
    expect(post?.tags).toEqual(["typescript"]);
  });

  it("splits a comma-separated tags value into multiple tags", () => {
    const post = posts.find((p) => p.slug === "setup-vps-for-rails-apps");
    expect(post?.tags).toEqual(["nginx", "lets-encrypt", "postgresql", "ruby"]);
  });

  it("orders posts by date, newest first", () => {
    const dates = posts.map((p) => p.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });
});

describe("deriveTopics", () => {
  it("dedupes tags across posts and counts occurrences", () => {
    const topics = deriveTopics(readPosts(CONTENT_DIR));
    const javascript = topics.find((t) => t.name === "javascript");
    expect(javascript?.count).toBe(3);
  });

  it("sorts topics alphabetically", () => {
    const topics = deriveTopics(readPosts(CONTENT_DIR));
    const names = topics.map((t) => t.name);
    expect(names).toEqual([...names].sort());
  });
});

describe("readProjectSlugs", () => {
  it("lists every project file's slug", () => {
    expect(readProjectSlugs(CONTENT_DIR)).toEqual(["app.junecare.co", "vespaiach.com"]);
  });
});