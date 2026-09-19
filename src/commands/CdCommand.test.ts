import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubGlobal(
  "MutationObserver",
  class {
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
);

vi.mock("alpinejs", () => {
  const storeMap = new Map<string, unknown>();

  return {
    default: {
      store(name: string, value?: unknown) {
        if (value !== undefined) {
          storeMap.set(name, value);
        }
        return storeMap.get(name);
      },
    },
  };
});

const { default: Alpine } = await import("alpinejs");
const { CdCommand } = await import("./CdCommand.ts");

describe("CdCommand", () => {
  beforeEach(() => {
    Alpine.store("manifest", {
      values: {
        "ls /": "/generated/root.html",
        "ls /about": "/generated/about.html",
        "ls /posts": "/generated/posts.html",
        "ls /topics": "/generated/topics.html",
      },
      get(path: string) {
        return path in this.values ? { existing: true, value: this.values[path] } : { existing: false };
      },
    });

    Alpine.store("cwd", {
      value: "/posts",
      update(value: string) {
        this.value = value;
      },
    });
  });

  it("accepts no arg and keeps the current directory", () => {
    const cd = CdCommand.init("cd", "/posts");
    expect(cd.resolvePath()).toEqual({
      valid: true,
      absolutePath: "/posts",
      resourcePath: "/generated/posts.html",
    });
  });

  it("does not require an arg since cd has an optional argRule", () => {
    const result = CdCommand.init("cd", "/posts").resolvePath();
    expect(result).not.toEqual({ valid: false, error: "Usage: cd [directory_path]" });
  });

  it("rejects invalid paths", () => {
    const cd = CdCommand.init("cd /posts//abc", "/posts");
    expect(cd.resolvePath()).toEqual({ valid: false, error: "Invalid path" });
  });

  it("rejects paths that do not exist in the manifest", () => {
    const cd = CdCommand.init("cd /posts/abc.md", "/posts");
    expect(cd.resolvePath()).toEqual({ valid: false, error: "Path does not exist: /posts/abc.md" });
  });

  it("accepts the root directory", () => {
    const cd = CdCommand.init("cd /", "/posts");
    expect(cd.resolvePath()).toEqual({
      valid: true,
      absolutePath: "/",
      resourcePath: "/generated/root.html",
    });
  });

  it("accepts the current directory via ~", () => {
    const cd = CdCommand.init("cd ~", "/posts");
    expect(cd.resolvePath()).toEqual({
      valid: true,
      absolutePath: "/posts",
      resourcePath: "/generated/posts.html",
    });
  });

  it("accepts the root directory via ~/", () => {
    const cd = CdCommand.init("cd ~/", "/posts");
    expect(cd.resolvePath()).toEqual({
      valid: true,
      absolutePath: "/",
      resourcePath: "/generated/root.html",
    });
  });

  it("reports a missing directory when the path cannot be resolved in the manifest", () => {
    const cd = CdCommand.init("cd /nonexistent", "/posts");
    expect(cd.resolvePath()).toEqual({ valid: false, error: "Path does not exist: /nonexistent" });
  });

  it("returns a cwd result without mutating the shared store", async () => {
    const cd = CdCommand.init("cd /about", "/posts");
    const result = await cd.execute();

    expect(result).toEqual({ kind: "cwd", cwd: "/about" });
    expect(Alpine.store("cwd").value).toBe("/posts");
  });

  it("execute resolves a valid path and updates the instance cwd", async () => {
    const cd = CdCommand.init("cd /about", "/posts");
    const result = await cd.execute();

    expect(result).toEqual({ kind: "cwd", cwd: "/about" });
    expect(cd.resolvePath()).toEqual({
      valid: true,
      absolutePath: "/about",
      resourcePath: "/generated/about.html",
    });
  });

  it("execute returns an error for an invalid path", async () => {
    const cd = CdCommand.init("cd /posts//abc", "/posts");
    const result = await cd.execute();

    expect(result).toEqual({ kind: "error", message: "Invalid path", cwd: "/posts" });
  });

  it("execute returns an error for a missing manifest entry", async () => {
    const cd = CdCommand.init("cd /nonexistent", "/posts");
    const result = await cd.execute();

    expect(result).toEqual({ kind: "error", message: "Path does not exist: /nonexistent", cwd: "/posts" });
  });
});