import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderMarkdownFragment } from "./renderMarkdownFragment.ts";

describe("renderMarkdownFragment", () => {
  it("uses the frontmatter title, meta line, and tag pills", () => {
    const raw =
      "---\ntitle: 'Hello World'\ndate: '2024-01-02T00:00:00.000Z'\ntags: a, b\n---\nOne two three.";
    const html = renderMarkdownFragment(raw, "~/posts/hello-world.md");
    expect(html).toContain("<h1");
    expect(html).toContain(">Hello World<");
    expect(html).toContain("2024-01-02   ·   3 words   ·   1 min read");
    expect(html).toContain(">#a<");
    expect(html).toContain(">#b<");
  });

  it("falls back to the first '#' heading as the title when there's no frontmatter", () => {
    const raw = "# About me\n\nPlaceholder bio.\n";
    const html = renderMarkdownFragment(raw, "~/about/me.md");
    expect(html).toContain(">About me<");
    expect(html).not.toContain("# About me");
    expect(html).toContain(">Placeholder bio.<");
  });

  it("omits the source footer when frontmatter has no github field", () => {
    const raw = "---\ntitle: 'No Source'\n---\nBody.";
    const html = renderMarkdownFragment(raw, "~/posts/no-source.md");
    expect(html).not.toContain("source:");
  });

  it("renders the source footer link when frontmatter has a github field", () => {
    const raw = "---\ntitle: 'Has Source'\ngithub: https://github.com/x/y.md\n---\nBody.";
    const html = renderMarkdownFragment(raw, "~/posts/has-source.md");
    expect(html).toContain('href="https://github.com/x/y.md"');
    expect(html).toContain("source:");
  });

  it("renders one line-div per source line in a fenced code block, tagged with its language", () => {
    const raw = "---\ntitle: 'Code'\n---\n```javascript\nconst a = 1;\nconst b = 2;\n```\n";
    const html = renderMarkdownFragment(raw, "~/posts/code.md");
    const lineDivs = html.match(/<div style="display: flex; gap: 16px;">/g) ?? [];
    expect(lineDivs).toHaveLength(2);
    expect(html).toContain(">javascript<");
  });

  it("HTML-escapes a literal tag appearing inside a fenced code sample instead of emitting real markup", () => {
    const raw = "---\ntitle: 'JSX'\n---\n```jsx\nconst el = <div className=\"x\" />;\n```\n";
    const html = renderMarkdownFragment(raw, "~/posts/jsx.md");
    expect(html).not.toContain("<div className=");
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
  });

  it("matches the known values for the real discard-after-usages.md post", () => {
    const raw = readFileSync("content/posts/discard-after-usages.md", "utf-8");
    const html = renderMarkdownFragment(raw, "~/posts/discard-after-usages.md");
    expect(html).toContain(">Discard after usages<");
    expect(html).toContain("2022-01-25   ·   411 words   ·   2 min read");
    expect(html).toContain(">#javascript<");
  });
});