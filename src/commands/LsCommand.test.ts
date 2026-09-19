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
const { LsCommand } = await import("./LsCommand.ts");

describe("LsCommand", () => {
  beforeEach(() => {
    Alpine.store("manifest", {
      values: {
        "ls /": "/generated/root.html",
        "ls /about": "/generated/about.html",
        "ls /about/projects": "/generated/projects.html",
        "ls /posts": "/generated/posts.html",
        "ls /topics": "/generated/topics.html",
      },
      get(path: string) {
        return path in this.values ? { existing: true, value: this.values[path] } : { existing: false };
      },
    });
  });

  it("resolves the current directory when no path is given", () => {
    expect(LsCommand.init("ls", "/posts").resolvePath()).toEqual({
      valid: true,
      absolutePath: "/posts",
      resourcePath: "/generated/posts.html",
    });
  });

  it("does not require an arg since ls has an optional argRule", () => {
    const result = LsCommand.init("ls", "/posts").resolvePath();
    expect(result).not.toEqual({ valid: false, error: "Usage: ls [file_path]" });
  });

  it("resolves a relative path against cwd", () => {
    expect(LsCommand.init("ls ../about/projects", "/posts").resolvePath()).toEqual({
      valid: true,
      absolutePath: "/about/projects",
      resourcePath: "/generated/projects.html",
    });
  });

  it("rejects an invalid path without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await LsCommand.init("ls /posts//projects", "/posts").execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "error", message: "ls: Invalid path", cwd: "/posts" });
  });

  it("rejects a path that is not in the manifest without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await LsCommand.init("ls typescript-notes.md", "/posts").execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      kind: "error",
      message: "ls: Path does not exist: /posts/typescript-notes.md",
      cwd: "/posts",
    });
  });

  it("fetches and returns the listing for a resolved directory", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<ul>posts</ul>" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await LsCommand.init("ls", "/posts").execute();

    expect(fetchMock).toHaveBeenCalledWith("/generated/posts.html");
    expect(result).toEqual({ kind: "html", html: "<ul>posts</ul>", cwd: "/posts" });
  });

  it("returns an error when the response isn't ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "" }));

    const result = await LsCommand.init("ls", "/posts").execute();

    expect(result).toEqual({ kind: "error", message: "ls: failed to execute command", cwd: "/posts" });
  });

  it("returns an error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await LsCommand.init("ls", "/posts").execute();

    expect(result).toEqual({ kind: "error", message: "ls: failed to execute command", cwd: "/posts" });
  });
});