import { describe, expect, it } from "vitest";
import { toAbsolutePath } from "./path.ts";

describe("toAbsolutePath", () => {
  it("resolves a relative path against a directory", () => {
    expect(toAbsolutePath("../posts", "/topics")).toEqual({ valid: true, absolutePath: "/posts" });
  });

  it("returns an absolute path unchanged (normalized)", () => {
    expect(toAbsolutePath("/about", "/topics")).toEqual({ valid: true, absolutePath: "/about" });
    expect(toAbsolutePath("~/about", "/topics")).toEqual({ valid: true, absolutePath: "/about" });
  });

  it("resolves '.' to the current directory", () => {
    expect(toAbsolutePath("./", "/about")).toEqual({ valid: true, absolutePath: "/about" });
  });

  it("no negative path", () => {
    expect(toAbsolutePath("../../posts", "/topics")).toEqual({ valid: true, absolutePath: "/" });
    expect(toAbsolutePath("../../../posts", "/topics")).toEqual({ valid: true, absolutePath: "/" });
  });

  it("resolves a nested relative path", () => {
    expect(toAbsolutePath("posts/hello", "/topics")).toEqual({
      valid: true,
      absolutePath: "/topics/posts/hello",
    });
  });

  it("collapses trailing slashes on the current path", () => {
    expect(toAbsolutePath("../posts", "/topics/")).toEqual({ valid: true, absolutePath: "/posts" });
  });

  it("resolves to root when everything is popped", () => {
    expect(toAbsolutePath("..", "/topics")).toEqual({ valid: true, absolutePath: "/" });
  });

  it("resolves when cwd is at root", () => {
    expect(toAbsolutePath("..", "/")).toEqual({ valid: true, absolutePath: "/" });
    expect(toAbsolutePath("./about", "/")).toEqual({ valid: true, absolutePath: "/about" });
    expect(toAbsolutePath("/about/projects", "/")).toEqual({ valid: true, absolutePath: "/about/projects" });
    expect(toAbsolutePath("/about/projects/abt", "/")).toEqual({
      valid: true,
      absolutePath: "/about/projects/abt",
    });
  });

  it("resolves projects folder", () => {
    expect(toAbsolutePath("about/projects", "/")).toEqual({ valid: true, absolutePath: "/about/projects" });
    expect(toAbsolutePath("/about/projects", "/")).toEqual({ valid: true, absolutePath: "/about/projects" });
    expect(toAbsolutePath("~/about/projects", "/")).toEqual({ valid: true, absolutePath: "/about/projects" });
    expect(toAbsolutePath("../about/projects", "/topics")).toEqual({
      valid: true,
      absolutePath: "/about/projects",
    });
  });

  it("rejects paths that are 512 characters or longer", () => {
    expect(toAbsolutePath("a".repeat(511), "/")).toEqual({ valid: false, error: "Path is too long" });
  });

  it("invalid path", () => {
    expect(toAbsolutePath("about//projects", "/")).toEqual({ valid: false, error: "Invalid path" });
    expect(toAbsolutePath("about///projects", "/")).toEqual({ valid: false, error: "Invalid path" });
  });
});