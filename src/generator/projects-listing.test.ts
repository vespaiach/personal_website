import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  generateProjectsListing,
  readProjectEntries,
  renderProjectsListingPartial,
} from "./projects-listing.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;
const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "projects-listing-"));
  symlinkSync(CONTENT_DIR, join(root, "content"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("readProjectEntries", () => {
  it("reads project files from content/about/projects", () => {
    const entries = readProjectEntries(CONTENT_DIR);

    expect(entries.map((entry) => entry.name)).toEqual(["app.junecare.co.md", "vespaiach.com.md"]);
    expect(entries.every((entry) => entry.type === "file")).toBe(true);
  });
});

describe("renderProjectsListingPartial", () => {
  it("renders project rows with file metadata", () => {
    const html = renderProjectsListingPartial(readProjectEntries(CONTENT_DIR));

    expect(html).toContain("total 2");
    expect(html).toContain("-rw-r--r--");
    expect(html).toContain("min");
    expect(html).toContain("app.junecare.co.md");
    expect(html).toContain("vespaiach.com.md");
  });
});

describe("generateProjectsListing", () => {
  it("writes the projects listing partial", () => {
    const root = createRoot();

    generateProjectsListing(root);

    const outputPath = join(root, "src", "generated", "projects-listing.html");
    expect(existsSync(outputPath)).toBe(true);
    expect(readFileSync(outputPath, "utf-8")).toContain("vespaiach.com.md");
  });
});