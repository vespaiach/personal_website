import { describe, expect, it } from "vitest";
import { CdCommand } from "./CdCommand.ts";

describe("CdCommand", () => {
  const cd = CdCommand.init();

  it("accepts no arg or an arg", () => {
    expect(cd.validate(undefined)).toEqual({ valid: true });
    expect(cd.validate("/posts")).toEqual({ valid: true });
  });

  it("uses the argument bound by init when execute receives no argument", async () => {
    const result = await CdCommand.init("/topics", { cwd: "/posts", section: "posts" }).execute();

    expect(result).toEqual({ kind: "navigate", path: "/topics/" });
  });

  it("prefers an execute argument over the argument bound by init", async () => {
    const result = await CdCommand.init("/about", { cwd: "/posts", section: "posts" }).execute();

    expect(result).toEqual({ kind: "navigate", path: "/about/" });
  });

  it("bare cd from a different section navigates to the posts route", async () => {
    const result = await CdCommand.init(undefined, { cwd: "/about", section: "about" }).execute();
    expect(result).toEqual({ kind: "navigate", path: "/" });
  });

  it("bare cd while already on the posts section updates cwd in place", async () => {
    const result = await CdCommand.init(undefined, { cwd: "/posts", section: "posts" }).execute();
    expect(result).toEqual({ kind: "cwd", cwd: "/" });
  });

  it("cd .. within the same section updates cwd in place", async () => {
    const result = await CdCommand.init("..", { cwd: "/about/projects", section: "about" }).execute();
    expect(result).toEqual({ kind: "cwd", cwd: "/about" });
  });

  it("cd to a different top-level section navigates to its route", async () => {
    const result = await CdCommand.init("/topics", { cwd: "/posts", section: "posts" }).execute();
    expect(result).toEqual({ kind: "navigate", path: "/topics/" });
  });

  it("cd to a relative directory within the same section updates cwd in place", async () => {
    const result = await CdCommand.init("projects", { cwd: "/about", section: "about" }).execute();
    expect(result).toEqual({ kind: "cwd", cwd: "/about/projects" });
  });

  it("cd into a file path is an error", async () => {
    const result = await CdCommand.init("me.md", { cwd: "/about", section: "about" }).execute();
    expect(result).toEqual({ kind: "error", message: "cd: no such directory: me.md" });
  });

  it("cd into a nonexistent path is an error", async () => {
    const result = await CdCommand.init("/nope", { cwd: "/posts", section: "posts" }).execute();
    expect(result).toEqual({ kind: "error", message: "cd: no such directory: /nope" });
  });
});