import { describe, expect, it } from "vitest";
import { getAvailablePaths, isDirectory, toAbsolutePath } from "./path.ts";

describe("toAbsolutePath", () => {
  it("resolves a relative path against a directory", () => {
    expect(toAbsolutePath("../posts", "/topics")).toBe("/posts");
  });

  it("returns an absolute path unchanged (normalized)", () => {
    expect(toAbsolutePath("/about", "/topics")).toBe("/about");
  });

  it("resolves '.' to the current directory", () => {
    expect(toAbsolutePath("./", "/about")).toBe("/about");
  });

  it("clamps '..' at the root instead of going negative", () => {
    expect(toAbsolutePath("../../posts", "/topics")).toBe("/posts");
  });

  it("resolves a nested relative path", () => {
    expect(toAbsolutePath("posts/hello", "/topics")).toBe("/topics/posts/hello");
  });

  it("collapses trailing slashes on the current path", () => {
    expect(toAbsolutePath("../posts", "/topics/")).toBe("/posts");
  });

  it("resolves to root when everything is popped", () => {
    expect(toAbsolutePath("..", "/topics")).toBe("/");
  });
});

describe("getAvailablePaths", () => {
  const paths = getAvailablePaths();

  it("includes the virtual /topics directory", () => {
    expect(paths["/topics"]).toBe(true);
  });

  it("includes the /posts directory and a known post", () => {
    expect(paths["/posts"]).toBe(true);
    expect(paths["/posts/discard-after-usages.md"]).toBe(true);
  });

  it("includes the /about directory and its files", () => {
    expect(paths["/about"]).toBe(true);
    expect(paths["/about/me.md"]).toBe(true);
    expect(paths["/about/stack.json"]).toBe(true);
  });

  it("includes a nested file under /about without a separate directory entry", () => {
    expect(paths["/about/projects/vespaiach.com.md"]).toBe(true);
    expect(paths["/about/projects"]).toBeUndefined();
  });

  it("does not include paths that don't exist", () => {
    expect(paths["/posts/does-not-exist.md"]).toBeUndefined();
  });
});

describe("isDirectory", () => {
  const paths = getAvailablePaths();

  it("treats the root as a directory", () => {
    expect(isDirectory("/", paths)).toBe(true);
  });

  it("treats a fixed root with zero descendants as a directory", () => {
    expect(isDirectory("/topics", paths)).toBe(true);
  });

  it("treats an implicit intermediate directory as a directory", () => {
    expect(isDirectory("/about/projects", paths)).toBe(true);
  });

  it("does not treat a leaf file as a directory", () => {
    expect(isDirectory("/about/me.md", paths)).toBe(false);
  });

  it("does not treat a nonexistent path as a directory", () => {
    expect(isDirectory("/nope", paths)).toBe(false);
  });
});