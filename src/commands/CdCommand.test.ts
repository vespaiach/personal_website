import { describe, expect, it } from "vitest";
import { CdCommand } from "./CdCommand.ts";

describe("CdCommand", () => {
  const cd = new CdCommand();

  it("accepts no arg or an arg", () => {
    expect(cd.validate(undefined)).toEqual({ valid: true });
    expect(cd.validate("/posts")).toEqual({ valid: true });
  });

  it("bare cd from a different section navigates to the posts route", async () => {
    const result = await cd.execute(undefined, { cwd: "/about", section: "about" });
    expect(result).toEqual({ kind: "navigate", path: "/" });
  });

  it("bare cd while already on the posts section updates cwd in place", async () => {
    const result = await cd.execute(undefined, { cwd: "/posts", section: "posts" });
    expect(result).toEqual({ kind: "cwd", cwd: "/" });
  });

  it("cd .. within the same section updates cwd in place", async () => {
    const result = await cd.execute("..", { cwd: "/about/projects", section: "about" });
    expect(result).toEqual({ kind: "cwd", cwd: "/about" });
  });

  it("cd to a different top-level section navigates to its route", async () => {
    const result = await cd.execute("/topics", { cwd: "/posts", section: "posts" });
    expect(result).toEqual({ kind: "navigate", path: "/topics/" });
  });

  it("cd to a relative directory within the same section updates cwd in place", async () => {
    const result = await cd.execute("projects", { cwd: "/about", section: "about" });
    expect(result).toEqual({ kind: "cwd", cwd: "/about/projects" });
  });

  it("cd into a file path is an error", async () => {
    const result = await cd.execute("me.md", { cwd: "/about", section: "about" });
    expect(result).toEqual({ kind: "error", message: "cd: no such directory: me.md" });
  });

  it("cd into a nonexistent path is an error", async () => {
    const result = await cd.execute("/nope", { cwd: "/posts", section: "posts" });
    expect(result).toEqual({ kind: "error", message: "cd: no such directory: /nope" });
  });
});