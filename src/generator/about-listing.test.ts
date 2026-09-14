import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateAboutListing, readAboutEntries, renderAboutListingPartial } from "./about-listing.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;
const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "about-listing-"));
  symlinkSync(CONTENT_DIR, join(root, "content"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("renderAboutListingPartial", () => {
  const html = renderAboutListingPartial(readAboutEntries(CONTENT_DIR));

  it("renders the three about entries", () => {
    expect(html).toContain("total 3");
    expect(html).toContain("me.md");
    expect(html).toContain("projects");
    expect(html).toContain("stack.json");
  });

  it("renders file and directory metadata", () => {
    expect(html).toContain("-rw-r--r--");
    expect(html).toContain("drwxr-xr-x");
    expect(html).toContain("1 min");
    expect(html).toContain("min");
  });
});

describe("generateAboutListing", () => {
  it("writes the about listing partial", () => {
    const root = createRoot();

    generateAboutListing(root);

    const outputPath = join(root, "src", "generated", "about-listing.html");
    expect(existsSync(outputPath)).toBe(true);
    expect(readFileSync(outputPath, "utf-8")).toContain("projects");
  });
});