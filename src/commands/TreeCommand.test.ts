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
const { TreeCommand } = await import("./TreeCommand.ts");

describe("TreeCommand", () => {
  beforeEach(() => {
    Alpine.store("manifest", {
      values: {
        "tree /": "/generated/root.html",
        "tree /about": "/generated/about.html",
        "tree /about/projects": "/generated/projects.html",
        "tree /posts": "/generated/posts.html",
        "tree /topics": "/generated/topics.html",
      },
      get(path: string) {
        return path in this.values ? { existing: true, value: this.values[path] } : { existing: false };
      },
    });
  });

  it("resolves the current directory when no path is given", () => {
    expect(TreeCommand.init("tree", "/posts").resolvePath()).toEqual({
      valid: true,
      absolutePath: "/posts",
      resourcePath: "/generated/posts.html",
    });
  });

  it("does not require an arg since tree has an optional argRule", () => {
    const result = TreeCommand.init("tree", "/posts").resolvePath();
    expect(result).not.toEqual({ valid: false, error: "Usage: tree [directory_path]" });
  });

  it("resolves a relative path against cwd", () => {
    expect(TreeCommand.init("tree ../about/projects", "/posts").resolvePath()).toEqual({
      valid: true,
      absolutePath: "/about/projects",
      resourcePath: "/generated/projects.html",
    });
  });

  it("resolves an absolute sub-folder path regardless of cwd", () => {
    expect(TreeCommand.init("tree ~/about/projects", "/posts").resolvePath()).toEqual({
      valid: true,
      absolutePath: "/about/projects",
      resourcePath: "/generated/projects.html",
    });
  });

  it("rejects an invalid path without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await TreeCommand.init("tree /posts//projects", "/posts").execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "error", message: "tree: Invalid path", cwd: "/posts" });
  });

  it("rejects a path that is not in the manifest without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await TreeCommand.init("tree typescript-notes.md", "/posts").execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      kind: "error",
      message: "tree: Path does not exist: /posts/typescript-notes.md",
      cwd: "/posts",
    });
  });

  it("fetches and returns the tree for a resolved directory", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, text: async () => "<article>posts tree</article>" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await TreeCommand.init("tree", "/posts").execute();

    expect(fetchMock).toHaveBeenCalledWith("/generated/posts.html");
    expect(result).toEqual({ kind: "html", html: "<article>posts tree</article>", cwd: "/posts" });
  });

  it("returns an error when the response isn't ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "" }));

    const result = await TreeCommand.init("tree", "/posts").execute();

    expect(result).toEqual({ kind: "error", message: "tree: failed to execute command", cwd: "/posts" });
  });

  it("returns an error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await TreeCommand.init("tree", "/posts").execute();

    expect(result).toEqual({ kind: "error", message: "tree: failed to execute command", cwd: "/posts" });
  });
});