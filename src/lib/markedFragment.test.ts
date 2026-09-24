import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderJsonView, renderMarkdownView } from "./markedFragment.ts";

describe("renderMarkdownView", () => {
  it("uses the frontmatter title, meta line, and tag pills", async () => {
    const raw =
      "---\ntitle: 'Hello World'\ndate: '2024-01-02T00:00:00.000Z'\ntags: a, b\n---\nOne two three.";
    const html = await renderMarkdownView(
      raw,
      "~/posts/hello-world.md",
      "https://vespaiach.com/posts/hello-world.html",
    );
    expect(html).toContain("<h1");
    expect(html).toContain(">Hello World<");
    expect(html).toContain("2024-01-02   ·   3 words   ·   1 min read");
    expect(html).toContain(">#a<");
    expect(html).toContain(">#b<");
  });

  it("falls back to the first '#' heading as the title when there's no frontmatter", async () => {
    const raw = "# About me\n\nPlaceholder bio.\n";
    const html = await renderMarkdownView(raw, "~/about/me.md", "https://vespaiach.com/about/me.html");
    expect(html).toContain(">About me<");
    expect(html).not.toContain("# About me");
    expect(html).toContain(">Placeholder bio.<");
  });

  it("omits the source footer when frontmatter has no github field", async () => {
    const raw = "---\ntitle: 'No Source'\n---\nBody.";
    const html = await renderMarkdownView(
      raw,
      "~/posts/no-source.md",
      "https://vespaiach.com/posts/no-source.html",
    );
    expect(html).not.toContain("source:");
  });

  it("renders the source footer link when frontmatter has a github field", async () => {
    const raw = "---\ntitle: 'Has Source'\ngithub: https://github.com/x/y.md\n---\nBody.";
    const html = await renderMarkdownView(
      raw,
      "~/posts/has-source.md",
      "https://vespaiach.com/posts/has-source.html",
    );
    expect(html).toContain('href="https://github.com/x/y.md"');
    expect(html).toContain("source:");
  });

  it("highlights fenced code blocks with shiki and wraps them in the copy-button chrome", async () => {
    const raw = "---\ntitle: 'Code'\n---\n```javascript\nconst a = 1;\n```\n";
    const html = await renderMarkdownView(raw, "~/posts/code.md", "https://vespaiach.com/posts/code.html");
    expect(html).toContain("data-code-block");
    expect(html).toContain(">javascript<");
    expect(html).toContain("color:var(--shiki-token-keyword, var(--syn-keyword))");
    expect(html).not.toContain("```");
  });

  it("falls back to plain-text highlighting for a fence language shiki doesn't recognize", async () => {
    const raw = "---\ntitle: 'Alias'\n---\n```base\necho hi\n```\n";
    const html = await renderMarkdownView(raw, "~/posts/alias.md", "https://vespaiach.com/posts/alias.html");
    expect(html).toContain("data-code-block");
    expect(html).toContain("echo hi");
  });

  it("renders unordered and ordered lists with the custom marker style", async () => {
    const raw = "---\ntitle: 'Lists'\n---\n- first\n- second\n\n1. one\n2. two\n";
    const html = await renderMarkdownView(raw, "~/posts/lists.md", "https://vespaiach.com/posts/lists.html");
    expect(html).toContain(">first<");
    expect(html).toContain(">1.<");
    expect(html).toContain(">2.<");
  });

  it("gives each heading depth its own mockup style", async () => {
    const raw = "---\ntitle: 'Headings'\n---\n# One\n\n## Two\n\n### Three\n";
    const html = await renderMarkdownView(
      raw,
      "~/posts/headings.md",
      "https://vespaiach.com/posts/headings.html",
    );
    expect(html).toContain('<h2 class="md-h1">One</h2>');
    expect(html).toContain('<h2 class="md-h2">Two</h2>');
    expect(html).toContain('<h3 class="md-h3">Three</h3>');
  });

  it("adds target=_blank and rel=noreferrer to links", async () => {
    const raw = "---\ntitle: 'Link'\n---\n[example](https://example.com)\n";
    const html = await renderMarkdownView(raw, "~/posts/link.md", "https://vespaiach.com/posts/link.html");
    expect(html).toContain('href="https://example.com" target="_blank" rel="noreferrer"');
  });

  it("renders the share, email, copy-link and full-screen actions for the page url", async () => {
    const raw = "---\ntitle: 'Share Me'\n---\nBody.";
    const html = await renderMarkdownView(
      raw,
      "~/posts/share-me.md",
      "https://vespaiach.com/posts/share-me.html",
    );
    expect(html).toContain(
      'href="https://x.com/intent/tweet?text=Share%20Me&amp;url=https%3A%2F%2Fvespaiach.com%2Fposts%2Fshare-me.html"',
    );
    expect(html).toContain(
      'href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fvespaiach.com%2Fposts%2Fshare-me.html"',
    );
    expect(html).toContain("https://bsky.app/intent/compose?text=Share%20Me%20https%3A%2F%2F");
    expect(html).toContain('href="mailto:?subject=Share%20Me&amp;body=https%3A%2F%2F');
    expect(html).toContain("navigator.clipboard.writeText('https://vespaiach.com/posts/share-me.html')");
    expect(html).toContain("$el.closest('.content-view').requestFullscreen()");
  });

  it("matches the known values for the real discard-after-usages.md post", async () => {
    const raw = readFileSync("content/posts/discard-after-usages.md", "utf-8");
    const html = await renderMarkdownView(
      raw,
      "~/posts/discard-after-usages.md",
      "https://vespaiach.com/posts/discard-after-usages.html",
    );
    expect(html).toContain(">Discard after usages<");
    expect(html).toContain("2022-01-25   ·   411 words   ·   2 min read");
    expect(html).toContain(">#javascript<");
  });
});

describe("renderJsonView", () => {
  it("renders stack.json as a highlighted JSON code block", async () => {
    const raw = readFileSync("content/about/stack.json", "utf-8");
    const html = await renderJsonView(raw, "~/about/stack.json");
    expect(html).toContain("~/about/stack.json");
    expect(html).toContain("data-code-block");
    expect(html).toMatch(/<span style="color:var\(--shiki-token-[a-z-]+, var\(--/);
    expect(html).toContain("languages");
  });
});