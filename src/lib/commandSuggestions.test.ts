import { describe, expect, it } from "vitest";
import { buildSuggestions, FIXED_COMMANDS } from "./commandSuggestions.ts";

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