import { describe, expect, it } from "vitest";
import { resolvePrompt } from "./resolvePrompt.ts";

describe("resolvePrompt", () => {
  it("resolves a single no-arg command without a resolvedPath", () => {
    expect(resolvePrompt("help", "/posts")).toEqual({
      valid: true,
      error: null,
      commands: [{ command: "help" }],
    });
  });

  it("resolves a command's arg to an absolute path", () => {
    expect(resolvePrompt("cd ../posts", "/topics")).toEqual({
      valid: true,
      error: null,
      commands: [{ command: "cd", arg: "../posts", resolvedPath: "/posts" }],
    });
  });

  it("resolves every command in a chain against the same cwd", () => {
    expect(resolvePrompt("cd ../posts & ls", "/topics")).toEqual({
      valid: true,
      error: null,
      commands: [
        { command: "cd", arg: "../posts", resolvedPath: "/posts" },
        { command: "ls", resolvedPath: "/topics" },
      ],
    });
  });

  it("resolves ls with no arg to the current directory", () => {
    expect(resolvePrompt("ls", "/about")).toEqual({
      valid: true,
      error: null,
      commands: [{ command: "ls", resolvedPath: "/about" }],
    });
  });

  it("reports an unknown command as invalid without resolving anything", () => {
    expect(resolvePrompt("grep -t react", "/posts")).toEqual({
      valid: false,
      error: "Unknown command: grep",
      commands: [],
    });
  });

  it("reports blank input as invalid", () => {
    expect(resolvePrompt("", "/posts")).toEqual({
      valid: false,
      error: "Wrong command syntax",
      commands: [],
    });
  });
});