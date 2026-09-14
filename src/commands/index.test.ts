import { describe, expect, it } from "vitest";
import { commands } from "./index.ts";

describe("commands registry", () => {
  it("has all 6 commands under their own name", () => {
    for (const name of ["ls", "cat", "cd", "clear", "tree", "help"]) {
      expect(commands[name]?.name).toBe(name);
    }
  });

  it("help lists every other command's syntax plus its own", async () => {
    const result = await commands.help?.execute(undefined, { cwd: "/posts", section: "posts" });
    expect(result?.kind).toBe("text");
    const text = (result as { kind: "text"; text: string }).text;
    for (const name of ["ls", "cat", "cd", "clear", "tree", "help"]) {
      expect(text).toContain(commands[name]?.syntax);
    }
  });
});