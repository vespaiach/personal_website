import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "./markdown.ts";

describe("parseFrontmatter", () => {
  it("parses single-quoted values", () => {
    const { fm } = parseFrontmatter("---\ntitle: 'Hello World'\n---\nbody text");
    expect(fm.title).toBe("Hello World");
  });

  it("parses double-quoted values", () => {
    const { fm } = parseFrontmatter('---\nexcerpt: "an excerpt"\n---\nbody');
    expect(fm.excerpt).toBe("an excerpt");
  });

  it("parses unquoted values", () => {
    const { fm } = parseFrontmatter("---\ntags: javascript, date\n---\nbody");
    expect(fm.tags).toBe("javascript, date");
  });

  it("keeps an apostrophe inside a double-quoted value", () => {
    const { fm } = parseFrontmatter('---\nexcerpt: "I\'ve had a great time"\n---\nbody');
    expect(fm.excerpt).toBe("I've had a great time");
  });

  it("returns the body separately from the frontmatter block", () => {
    const { body } = parseFrontmatter("---\ntitle: 'x'\n---\nfirst line\nsecond line");
    expect(body).toBe("first line\nsecond line");
  });

  it("returns an empty fm and the raw text unchanged when there is no frontmatter", () => {
    const { fm, body } = parseFrontmatter("just a plain body");
    expect(fm).toEqual({});
    expect(body).toBe("just a plain body");
  });
});