import { describe, expect, it } from "vitest";
import type { FolderSource } from "./collect.ts";
import { renderTreeView } from "./renderTreeView.ts";

describe("renderTreeView", () => {
  const folders: FolderSource[] = [
    {
      type: "folder",
      virtualPath: "/",
      entries: [
        { name: "posts", isDirectory: true, size: "-", date: "-", isoDate: "" },
        { name: "about", isDirectory: true, size: "-", date: "-", isoDate: "" },
      ],
    },
    {
      type: "folder",
      virtualPath: "/about",
      entries: [
        { name: "me.md", isDirectory: false, size: "1 min", date: "Mar 23 2025", isoDate: "2025-03-23" },
        { name: "projects", isDirectory: true, size: "-", date: "-", isoDate: "" },
      ],
    },
    {
      type: "folder",
      virtualPath: "/about/projects",
      entries: [{ name: "vespaiach.com.md", isDirectory: false, size: "2 min", date: "-", isoDate: "" }],
    },
    {
      type: "folder",
      virtualPath: "/posts",
      entries: [{ name: "typescript-notes.md", isDirectory: false, size: "8 min", date: "-", isoDate: "" }],
    },
  ];

  it("renders the root as ~ followed by alphabetically sorted, nested rows", () => {
    const html = renderTreeView(folders);

    expect(html.indexOf(">~<")).toBeGreaterThan(-1);
    expect(html.indexOf(">about<")).toBeLessThan(html.indexOf(">posts<"));
    expect(html).toContain("├── ");
    expect(html).toContain("└── ");
    expect(html).toContain("│   ");
  });

  it("colors directories with --dir and files with --ink", () => {
    const html = renderTreeView(folders);

    expect(html).toContain('class="tree-view__name tree-view__name--dir">about<');
    expect(html).toContain('class="tree-view__name">me.md<');
  });

  it("recurses into nested directories that have their own listing", () => {
    const html = renderTreeView(folders);

    expect(html).toContain("projects");
    expect(html).toContain("vespaiach.com.md");
  });

  it("treats a directory with no matching listing as a leaf", () => {
    const html = renderTreeView([
      {
        type: "folder",
        virtualPath: "/",
        entries: [{ name: "topics", isDirectory: true, size: "-", date: "-", isoDate: "" }],
      },
      {
        type: "folder",
        virtualPath: "/topics",
        entries: [{ name: "javascript", isDirectory: true, size: "-", date: "-", isoDate: "" }],
      },
    ]);

    expect(html).toContain("javascript");
  });

  it("escapes entry names", () => {
    const html = renderTreeView([
      {
        type: "folder",
        virtualPath: "/",
        entries: [{ name: "<script>", isDirectory: false, size: "-", date: "-", isoDate: "" }],
      },
    ]);

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});