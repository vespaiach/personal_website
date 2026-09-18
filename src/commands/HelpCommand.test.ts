import { describe, expect, it } from "vitest";
import type { CommandDescriptor } from "./Command.ts";
import { HelpCommand } from "./HelpCommand.ts";

describe("HelpCommand", () => {
  const fakeCommands: CommandDescriptor[] = [
    { name: "ls", syntax: "ls [file_path]", description: "List things." },
    { name: "cat", syntax: "cat <file_path>", description: "Print a file." },
  ];
  const help = HelpCommand.init(undefined, undefined, fakeCommands);
  const context = { cwd: "/posts", section: "posts" as const };

  it("rejects an arg", () => {
    expect(help.validate("me")).toEqual({ valid: false, error: "Usage: help" });
  });

  it("accepts no arg", () => {
    expect(help.validate(undefined)).toEqual({ valid: true });
  });

  it("lists the injected commands in order, followed by its own line", async () => {
    const result = await HelpCommand.init(undefined, context, fakeCommands).execute();
    expect(result.kind).toBe("text");
    const lines = (result as { kind: "text"; text: string }).text.split("\n");
    expect(lines[0]).toContain("ls [file_path]");
    expect(lines[1]).toContain("cat <file_path>");
    expect(lines[2]).toContain("help");
    expect(lines).toHaveLength(3);
  });
});