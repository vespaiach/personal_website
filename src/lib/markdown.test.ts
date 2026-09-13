import { describe, expect, it } from "vitest";
import { parseFrontmatter, toBlocks } from "./markdown.ts";

describe("parseFrontmatter", () => {
  it("parses a frontmatter block and strips surrounding quotes from values", () => {
    const raw = "---\ntitle: 'Hello World'\nexcerpt: \"Some text\"\ntags: a, b\n---\n\nBody text here.\n";
    const { fm, body } = parseFrontmatter(raw);
    expect(fm).toEqual({ title: "Hello World", excerpt: "Some text", tags: "a, b" });
    expect(body).toBe("\nBody text here.\n");
  });

  it("leaves an unquoted value untouched", () => {
    const raw = "---\ngithub: https://example.com/x.md\n---\nBody.";
    const { fm } = parseFrontmatter(raw);
    expect(fm.github).toBe("https://example.com/x.md");
  });

  it("returns empty frontmatter and the original body when there's no leading '---'", () => {
    const raw = "# Heading\n\nJust body.";
    expect(parseFrontmatter(raw)).toEqual({ fm: {}, body: raw });
  });

  it("returns empty frontmatter and the original text when the closing '---' is missing", () => {
    const raw = "---\ntitle: 'Untitled'\n\nBody without a closing delimiter.";
    expect(parseFrontmatter(raw)).toEqual({ fm: {}, body: raw });
  });
});

describe("toBlocks", () => {
  it("buckets heading depth into levels 1, 2, and 3+", () => {
    const blocks = toBlocks("# Title\n\n## Sub\n\n### Sub sub\n");
    expect(blocks).toEqual([
      { kind: "heading", level: 1, text: "Title" },
      { kind: "heading", level: 2, text: "Sub" },
      { kind: "heading", level: 3, text: "Sub sub" },
    ]);
  });

  it("splits a paragraph into inline spans for bold, italic, code, links, and bare URLs", () => {
    const blocks = toBlocks(
      "This is **bold**, *em*, `code`, [link](https://x.com), and https://bare.com text.",
    );
    expect(blocks).toHaveLength(1);
    const block = blocks[0];
    if (block.kind !== "paragraph") throw new Error("expected a paragraph block");
    expect(block.spans).toContainEqual({ kind: "strong", text: "bold" });
    expect(block.spans).toContainEqual({ kind: "em", text: "em" });
    expect(block.spans).toContainEqual({ kind: "code", text: "code" });
    expect(block.spans).toContainEqual({ kind: "link", text: "link", href: "https://x.com" });
    expect(block.spans).toContainEqual({
      kind: "link",
      text: "https://bare.com",
      href: "https://bare.com",
    });
  });

  it("tokenizes a fenced code block and keeps one line per source line", () => {
    const blocks = toBlocks("```javascript\nconst a = 1;\nlet b = 2;\n```");
    expect(blocks).toHaveLength(1);
    const block = blocks[0];
    if (block.kind !== "code") throw new Error("expected a code block");
    expect(block.lang).toBe("javascript");
    expect(block.lines).toHaveLength(2);
  });

  it("keeps a list open across a blank line but splits it at a code fence", () => {
    const blocks = toBlocks("- one\n\n- two\n\n```text\ncode\n```\n\n- three");
    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toMatchObject({ kind: "list", items: [{ marker: "-" }, { marker: "-" }] });
    expect(blocks[1]).toMatchObject({ kind: "code" });
    expect(blocks[2]).toMatchObject({ kind: "list", items: [{ marker: "-" }] });
  });

  it("numbers an ordered list using each item's literal marker", () => {
    const blocks = toBlocks("1. first\n2. second");
    expect(blocks).toEqual([
      {
        kind: "list",
        items: [
          { marker: "1.", spans: [{ kind: "text", text: "first" }] },
          { marker: "2.", spans: [{ kind: "text", text: "second" }] },
        ],
      },
    ]);
  });

  it("emits a horizontal rule block for a standalone '---' line", () => {
    const blocks = toBlocks("Some text.\n\n---\n\nMore text.");
    expect(blocks).toEqual([
      { kind: "paragraph", spans: [{ kind: "text", text: "Some text." }] },
      { kind: "hr" },
      { kind: "paragraph", spans: [{ kind: "text", text: "More text." }] },
    ]);
  });
});