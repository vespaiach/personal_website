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

  it("renders only the subtree under the given root path, labelled ~/path", () => {
    const html = renderTreeView(folders, "/about");

    expect(html).toContain(">~/about<");
    expect(html).toContain("me.md");
    expect(html).toContain("vespaiach.com.md");
    expect(html).not.toContain("typescript-notes.md");
    expect(html).not.toContain(">about<");
  });

  it("renders a nested folder as the root without its parents", () => {
    const html = renderTreeView(folders, "/about/projects");

    expect(html).toContain(">~/about/projects<");
    expect(html).toContain("└── ");
    expect(html).toContain("vespaiach.com.md");
    expect(html).not.toContain("me.md");
  });

  it("renders just the root label for a folder with no listing", () => {
    const html = renderTreeView(folders, "/missing");

    expect(html).toContain(">~/missing<");
    expect(html).not.toContain("tree-view__line");
  });

  it("colors directories with --dir and files with --ink", () => {
    const html = renderTreeView(folders);

    expect(html).toContain('<button class="tree-view__name tree-view__name--dir"');
    expect(html).toContain('<button class="tree-view__name"');
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

  it("colors symlinks with --path", () => {
    const html = renderTreeView([
      {
        type: "folder",
        virtualPath: "/",
        entries: [
          {
            name: "post.md",
            isDirectory: false,
            size: "1 min",
            date: "-",
            isoDate: "",
            linkTarget: "../posts/post.md",
          },
        ],
      },
    ]);

    expect(html).toContain('<button class="tree-view__name tree-view__name--link"');
  });

  it("makes file rows cat the file by its full path", () => {
    const html = renderTreeView(folders);

    expect(html).toContain("$store.prompts.add('cat /about/me.md', $store.cwd.value)");
    expect(html).toContain("$store.prompts.add('cat /about/projects/vespaiach.com.md', $store.cwd.value)");
  });

  it("makes directory rows cd into the directory followed by ls", () => {
    const html = renderTreeView(folders);

    expect(html).toContain("$store.prompts.add('cd ~/about &amp;&amp; ls', $store.cwd.value)");
    expect(html).toContain("$store.prompts.add('cd ~/about/projects &amp;&amp; ls', $store.cwd.value)");
  });

  it("makes symlink rows cat the resolved target post", () => {
    const html = renderTreeView(
      [
        {
          type: "folder",
          virtualPath: "/topics",
          entries: [{ name: "javascript", isDirectory: true, size: "-", date: "-", isoDate: "" }],
        },
        {
          type: "folder",
          virtualPath: "/topics/javascript",
          entries: [
            {
              name: "discard-after-usages.md",
              isDirectory: false,
              size: "1 min",
              date: "-",
              isoDate: "",
              linkTarget: "../../posts/discard-after-usages.md",
            },
          ],
        },
      ],
      "/topics",
    );

    expect(html).toContain("$store.prompts.add('cat /posts/discard-after-usages.md', $store.cwd.value)");
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