import { describe, expect, it } from "vitest";
import { buildSuggestions, FIXED_COMMANDS, pushRecent } from "./commandSuggestions.ts";

describe("buildSuggestions", () => {
  it("returns the first 8 fixed commands for an empty query with no recent history", () => {
    expect(buildSuggestions("", [])).toEqual(
      FIXED_COMMANDS.slice(0, 8).map(([label, hint]) => ({ label, hint })),
    );
  });

  it("prepends up to 3 recent commands, most-recent-first, for an empty query", () => {
    const recent = ["ls", "cd ~/posts", "help", "pwd"];
    const result = buildSuggestions("", recent);
    expect(result.slice(0, 3)).toEqual([
      { label: "pwd", hint: "recent" },
      { label: "help", hint: "recent" },
      { label: "cd ~/posts", hint: "recent" },
    ]);
    expect(result.slice(3)).toEqual(FIXED_COMMANDS.slice(0, 8).map(([label, hint]) => ({ label, hint })));
  });

  it("caps recent suggestions at 3 even with a longer history", () => {
    const recent = ["a", "b", "c", "d", "e"];
    const result = buildSuggestions("", recent);
    expect(result.slice(0, 3)).toEqual([
      { label: "e", hint: "recent" },
      { label: "d", hint: "recent" },
      { label: "c", hint: "recent" },
    ]);
  });

  it("filters fixed commands by case-insensitive prefix", () => {
    expect(buildSuggestions("CD", [])).toEqual([
      { label: "cd ~/posts", hint: "the notes" },
      { label: "cd ~/topics", hint: "one dir per tag" },
      { label: "cd ~/about", hint: "me.md, stack.json, projects" },
    ]);
  });

  it("orders matching recent commands ahead of matching fixed commands", () => {
    const result = buildSuggestions("h", ["ls", "help", "history"]);
    expect(result).toEqual([
      { label: "history", hint: "recent" },
      { label: "help", hint: "recent" },
      { label: "history", hint: "" },
      { label: "help", hint: "all commands" },
    ]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(buildSuggestions("zzz", ["ls", "cd ~/posts"])).toEqual([]);
  });

  it("trims leading and trailing whitespace before matching", () => {
    expect(buildSuggestions("  ls  ", [])).toEqual([{ label: "ls", hint: "list the current directory" }]);
  });
});

describe("pushRecent", () => {
  it("appends a command to the end of the list", () => {
    expect(pushRecent(["ls"], "pwd")).toEqual(["ls", "pwd"]);
  });

  it("evicts the oldest entry once the list exceeds the cap", () => {
    const recent = Array.from({ length: 20 }, (_, i) => `cmd${i}`);
    const result = pushRecent(recent, "cmd20");
    expect(result.length).toBe(20);
    expect(result[0]).toBe("cmd1");
    expect(result[result.length - 1]).toBe("cmd20");
  });

  it("keeps duplicate entries without de-duplication", () => {
    expect(pushRecent(["ls", "pwd"], "ls")).toEqual(["ls", "pwd", "ls"]);
  });

  it("does not mutate the input array", () => {
    const recent = ["ls"];
    pushRecent(recent, "pwd");
    expect(recent).toEqual(["ls"]);
  });
});