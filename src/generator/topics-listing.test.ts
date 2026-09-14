import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readPosts } from "../lib/utils.ts";
import { deriveTopicListings, generateTopicsListing, renderTopicsListingPartial } from "./topics-listing.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;
const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "topics-listing-"));
  symlinkSync(CONTENT_DIR, join(root, "content"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("deriveTopicListings", () => {
  it("counts tags and keeps the newest post date for each tag", () => {
    const topics = deriveTopicListings([
      { date: "2025-01-01", tags: ["typescript", "web"] },
      { date: "2025-03-01", tags: ["typescript"] },
      { date: "2024-12-01", tags: ["web"] },
    ]);

    expect(topics).toEqual([
      { name: "typescript", count: 2, date: "Mar 1 2025", isoDate: "2025-03-01" },
      { name: "web", count: 2, date: "Jan 1 2025", isoDate: "2025-01-01" },
    ]);
  });
});

describe("renderTopicsListingPartial", () => {
  it("renders topic rows with directory styling", () => {
    const html = renderTopicsListingPartial([
      { name: "typescript", count: 2, date: "Mar 1 2025", isoDate: "2025-03-01" },
    ]);

    expect(html).toContain("total 1");
    expect(html).toContain("drwxr-xr-x");
    expect(html).toContain("Mar 1 2025");
    expect(html).toContain("typescript");
  });
});

describe("generateTopicsListing", () => {
  it("writes the topics listing partial from post frontmatter", () => {
    const root = createRoot();
    const expectedTopic = readPosts(CONTENT_DIR)[0].tags[0];

    generateTopicsListing(root);

    const outputPath = join(root, "src", "generated", "topics-listing.html");
    expect(existsSync(outputPath)).toBe(true);
    expect(readFileSync(outputPath, "utf-8")).toContain(expectedTopic);
  });
});