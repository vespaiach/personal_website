import { describe, expect, it } from "vitest";
import { resolvePrompt } from "./resolvePrompt.ts";

const MANIFEST: Record<string, string> = {
  "/": "/generated/root.html",
  "/posts": "/generated/posts.html",
  "/posts/abc.md": "/generated/posts/abc.html",
  "/topics": "/generated/topics.html",
  "/about": "/generated/about.html",
  "/about/projects": "/generated/projects/about.html",
  "/about/projects/me.md": "/generated/projects/about/me.html",
};

describe("resolvePrompt", () => {
  it("resolves a single no-arg command without a resolvedPath", () => {
    expect(resolvePrompt("help", "/posts", MANIFEST)).toEqual({
      valid: true,
      error: null,
      commands: [{ command: "help" }],
    });
  });

  it("resolves a command's arg to an absolute path", () => {
    expect(resolvePrompt("cd ../posts", "/topics", MANIFEST)).toEqual({
      valid: true,
      error: null,
      commands: [{ command: "cd", arg: "../posts", resolvedPath: "/posts" }],
    });
  });

  it("resolves every command in a chain against the same cwd", () => {
    expect(resolvePrompt("cd ../posts & ls", "/topics", MANIFEST)).toEqual({
      valid: true,
      error: null,
      commands: [
        { command: "cd", arg: "../posts", resolvedPath: "/posts" },
        { command: "ls" },
      ],
    });
  });

  it("resolves ls with no arg to the current directory", () => {
    expect(resolvePrompt("ls", "/about", MANIFEST)).toEqual({
      valid: true,
      error: null,
      commands: [{ command: "ls" }],
    });
  });

  it("reports an unknown command as invalid without resolving anything", () => {
    expect(resolvePrompt("grep -t react", "/posts", MANIFEST)).toEqual({
      valid: false,
      error: "Unknown command: grep",
      commands: [],
    });
  });

  it("reports blank input as invalid", () => {
    expect(resolvePrompt("", "/posts", MANIFEST)).toEqual({
      valid: false,
      error: "Wrong command syntax",
      commands: [],
    });
  });

  it("reports a path missing from the manifest as invalid", () => {
    expect(resolvePrompt("cd ../does-not-exist", "/topics", MANIFEST)).toEqual({
      valid: false,
      error: "No such file or directory: ../does-not-exist",
      commands: [],
    });
  });

  it("stops at the first unresolved path in a chain", () => {
    expect(resolvePrompt("ls & cat missing.md", "/posts", MANIFEST)).toEqual({
      valid: false,
      error: "No such file or directory: missing.md",
      commands: [],
    });
  });

  it("verify resolving path when cwd is empty", () => {
    expect(resolvePrompt("cd ~/posts & ls", "", MANIFEST)).toEqual({
      valid: true,
      error: null,
      commands: [
        { command: "cd", arg: "~/posts", resolvedPath: "/posts" },
        { command: "ls" },
      ],
    });
  });
});