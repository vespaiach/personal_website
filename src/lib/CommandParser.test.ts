import { describe, expect, it } from "vitest";
import { parseCommand } from "./CommandParser.ts";

describe("parseCommand", () => {
  it("returns a single command unchanged", () => {
    expect(parseCommand("ls -la")).toEqual(["ls -la"]);
  });

  it("splits chained commands on &&", () => {
    expect(parseCommand("ls -la && cd foo && cat  bar.txt")).toEqual(["ls -la", "cd foo", "cat bar.txt"]);
  });

  it("trims leading and trailing whitespace", () => {
    expect(parseCommand("   ls -la   ")).toEqual(["ls -la"]);
  });

  it("collapses multiple spaces between command and arguments", () => {
    expect(parseCommand("ls    -la")).toEqual(["ls -la"]);
  });

  it("normalizes whitespace around the && separator", () => {
    expect(parseCommand("ls -la&&cd foo")).toEqual(["ls -la", "cd foo"]);
    expect(parseCommand("ls -la   &&   cd foo")).toEqual(["ls -la", "cd foo"]);
  });

  it("drops empty segments from stray or trailing separators", () => {
    expect(parseCommand("ls -la && && cd foo")).toEqual(["ls -la", "cd foo"]);
    expect(parseCommand("ls -la &&")).toEqual(["ls -la"]);
    expect(parseCommand("&& ls -la")).toEqual(["ls -la"]);
  });

  it("lowercases the command name but keeps the case of its arguments", () => {
    expect(parseCommand("CD ~/topics/PRD && Cat Notes.md")).toEqual(["cd ~/topics/PRD", "cat Notes.md"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseCommand("")).toEqual([]);
    expect(parseCommand("   ")).toEqual([]);
  });
});