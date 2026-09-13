import { describe, expect, it } from "vitest";
import { parseCommand } from "./CommandParser.ts";

describe("parseCommand", () => {
  it("parses a single command with an arg", () => {
    expect(parseCommand("cat abc.md")).toEqual({
      success: true,
      result: [{ command: "cat", arg: "abc.md" }],
      error: null,
    });
  });

  it("parses a single command without an arg", () => {
    expect(parseCommand("ls")).toEqual({
      success: true,
      result: [{ command: "ls" }],
      error: null,
    });
  });

  it("splits chained commands on &", () => {
    expect(parseCommand("cd ../posts & ls")).toEqual({
      success: true,
      result: [{ command: "cd", arg: "../posts" }, { command: "ls" }],
      error: null,
    });
  });

  it("keeps absolute-path and relative-path args distinct", () => {
    expect(parseCommand("cd /topics & ls ../")).toEqual({
      success: true,
      result: [
        { command: "cd", arg: "/topics" },
        { command: "ls", arg: "../" },
      ],
      error: null,
    });
  });

  it("collapses extra whitespace around commands and separators", () => {
    expect(parseCommand("  cd   ../posts   &   ls  ")).toEqual({
      success: true,
      result: [{ command: "cd", arg: "../posts" }, { command: "ls" }],
      error: null,
    });
  });

  it("keeps multi-word args intact as a single arg string", () => {
    expect(parseCommand("cat notes on things.md")).toEqual({
      success: true,
      result: [{ command: "cat", arg: "notes on things.md" }],
      error: null,
    });
  });

  it("accepts every supported command with no arg (excluding cat/cd, which require one)", () => {
    for (const command of ["ls", "help", "clear", "tree"]) {
      expect(parseCommand(command)).toEqual({
        success: true,
        result: [{ command }],
        error: null,
      });
    }
  });

  it("fails on a completely empty command", () => {
    expect(parseCommand("")).toEqual({ success: false, result: [], error: "Wrong command syntax" });
    expect(parseCommand("   ")).toEqual({ success: false, result: [], error: "Wrong command syntax" });
  });

  it("fails on doubled separators with nothing between them", () => {
    expect(parseCommand("&&")).toEqual({ success: false, result: [], error: "Wrong command syntax" });
  });

  it("fails on leading, trailing, or repeated separators", () => {
    expect(parseCommand("& ls & & cd ..&")).toEqual({
      success: false,
      result: [],
      error: "Wrong command syntax",
    });
  });

  it("fails on a command outside the supported list", () => {
    expect(parseCommand("grep -t react")).toEqual({
      success: false,
      result: [],
      error: "Unknown command: grep",
    });
  });

  it("fails the whole chain if any command in it is unsupported", () => {
    expect(parseCommand("ls & whoami")).toEqual({
      success: false,
      result: [],
      error: "Unknown command: whoami",
    });
  });

  it("fails when cat or cd is missing its required arg", () => {
    expect(parseCommand("cat")).toEqual({ success: false, result: [], error: "Wrong command syntax" });
    expect(parseCommand("cd")).toEqual({ success: false, result: [], error: "Wrong command syntax" });
  });

  it("fails when help or clear is given an arg", () => {
    expect(parseCommand("help me")).toEqual({
      success: false,
      result: [],
      error: "Wrong command syntax",
    });
    expect(parseCommand("clear now")).toEqual({
      success: false,
      result: [],
      error: "Wrong command syntax",
    });
  });

  it("allows ls and tree with or without an arg", () => {
    expect(parseCommand("ls")).toEqual({ success: true, result: [{ command: "ls" }], error: null });
    expect(parseCommand("ls /posts")).toEqual({
      success: true,
      result: [{ command: "ls", arg: "/posts" }],
      error: null,
    });
    expect(parseCommand("tree")).toEqual({ success: true, result: [{ command: "tree" }], error: null });
    expect(parseCommand("tree /posts")).toEqual({
      success: true,
      result: [{ command: "tree", arg: "/posts" }],
      error: null,
    });
  });
});