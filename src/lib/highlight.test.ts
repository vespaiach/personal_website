import { describe, expect, it } from "vitest";
import { tokenizeCode } from "./highlight.ts";

describe("tokenizeCode", () => {
  it("classifies JavaScript keywords, function calls, strings, numbers, and comments", () => {
    const lines = tokenizeCode("const x = 1; // note\nlog('hi');", "javascript");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContainEqual({ text: "const", tone: "keyword" });
    expect(lines[0]).toContainEqual({ text: "1", tone: "number" });
    expect(lines[0]).toContainEqual({ text: "// note", tone: "comment" });
    expect(lines[1]).toContainEqual({ text: "log", tone: "fn" });
    expect(lines[1]).toContainEqual({ text: "'hi'", tone: "string" });
  });

  it("leaves an identifier not followed by '(' and not a keyword as plain", () => {
    const lines = tokenizeCode("value", "javascript");
    expect(lines[0]).toContainEqual({ text: "value", tone: "plain" });
  });

  it("classifies shell keywords and comments for bash", () => {
    const lines = tokenizeCode("cd /tmp # go home\nls -la", "bash");
    expect(lines[0]).toContainEqual({ text: "cd", tone: "keyword" });
    expect(lines[0]).toContainEqual({ text: "# go home", tone: "comment" });
    expect(lines[1]).toContainEqual({ text: "ls", tone: "keyword" });
  });

  it("treats 'base' (ASCII-art fences) as shell-flavored, not JS-flavored", () => {
    const lines = tokenizeCode("├── src", "base");
    expect(lines[0]).toContainEqual({ text: "src", tone: "plain" });
  });

  it("treats a whole JSDoc-style comment line as a comment for non-shell languages", () => {
    const lines = tokenizeCode(" * some doc line", "typescript");
    expect(lines[0]).toEqual([{ text: " * some doc line", tone: "comment" }]);
  });

  it("returns one empty plain token for a blank line", () => {
    const lines = tokenizeCode("", "javascript");
    expect(lines).toEqual([[{ text: "", tone: "plain" }]]);
  });

  it("preserves one line per input line", () => {
    const lines = tokenizeCode("a\nb\nc", "javascript");
    expect(lines).toHaveLength(3);
  });
});