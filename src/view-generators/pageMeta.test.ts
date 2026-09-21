import { describe, expect, it } from "vitest";
import type { Source } from "./collect.ts";
import { metaFor } from "./pageMeta.ts";

const CONTENT_DIR = new URL("../../content", import.meta.url).pathname;

function fileSource(virtualPath: string, kind: "markdown" | "resume" = "markdown"): Source {
  return { type: "file", virtualPath, filePath: `${CONTENT_DIR}${virtualPath}`, kind };
}

describe("metaFor", () => {
  it("reads a post's title, excerpt, dates and tags from its front matter", () => {
    expect(metaFor(fileSource("/posts/setup-home-dns-server-on-mac.md"))).toEqual({
      title: "Set Up a Home DNS Server on MacBook",
      description: expect.stringContaining("set up a DNS server on a MacBook"),
      article: {
        published: "2025-05-23T00:00:00.000Z",
        modified: "2025-05-23T00:00:00.000Z",
        tags: ["dns", "dnsmasq"],
      },
    });
  });

  it("normalises a date with a numeric offset to ISO 8601", () => {
    const { article } = metaFor(fileSource("/posts/javascript-interesting-things.md"));

    expect(article?.published).toBe("2022-01-26T05:00:00.000Z");
  });

  it("falls back to the first heading for the title and prefers description over excerpt", () => {
    const meta = metaFor(fileSource("/about/me.md"));

    expect(meta.title).toBe("About Me");
    expect(meta.description).toContain("full-stack web developer");
    expect(meta.article).toBeUndefined();
  });

  it("falls back to the file name when a page has neither a title nor a heading", () => {
    expect(metaFor(fileSource("/about/projects/vespaiach.com.md"))).toEqual({
      title: "vespaiach.com.md",
      description: undefined,
      article: undefined,
    });
  });

  it("uses the hand-written meta of a section", () => {
    const meta = metaFor({ type: "folder", virtualPath: "/about", entries: [] });

    expect(meta.title).toBe("About Trinh Nguyen");
    expect(meta.description).toContain("resume");
  });

  it("describes a topic folder by the posts it lists", () => {
    const entry = { isDirectory: false, size: "", date: "", isoDate: "" };
    const meta = metaFor({
      type: "folder",
      virtualPath: "/topics/javascript",
      entries: [
        { ...entry, name: "date.md", title: "Working With Dates" },
        { ...entry, name: "untitled.md" },
      ],
    });

    expect(meta).toEqual({
      title: "Posts about javascript",
      description: "Posts about javascript on vespaiach.com: Working With Dates, untitled.md.",
    });
  });
});