import { describe, expect, it } from "vitest";
import { renderListingView } from "./renderListingView.ts";

describe("renderListingView", () => {
  it("renders the total count and one row per entry", () => {
    const html = renderListingView("/posts", [
      {
        name: "typescript-notes.md",
        isDirectory: false,
        size: "8 min",
        date: "Mar 23 2025",
        isoDate: "2025-03-23",
      },
      {
        name: "prismjs-loader.md",
        isDirectory: false,
        size: "2 min",
        date: "Mar 29 2025",
        isoDate: "2025-03-29",
      },
    ]);

    expect(html).toContain("total 2");
    expect(html).toContain("-rw-r--r--");
    expect(html).toContain("typescript-notes.md");
    expect(html).toContain("cat /posts/typescript-notes.md");
    expect(html).toContain('<time datetime="2025-03-23">Mar 23 2025</time>');
  });

  it("renders directory rows without a linked date when isoDate is empty", () => {
    const html = renderListingView("/", [
      { name: "posts", isDirectory: true, size: "-", date: "-", isoDate: "" },
    ]);

    expect(html).toContain("drwxr-xr-x");
    expect(html).not.toContain("<time");
  });

  it("escapes entry names", () => {
    const html = renderListingView("/topics", [
      { name: "<script>", isDirectory: true, size: "-", date: "-", isoDate: "" },
    ]);

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});