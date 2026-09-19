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
const { CatCommand } = await import("./CatCommand.ts");

describe("CatCommand", () => {
  beforeEach(() => {
    Alpine.store("manifest", {
      values: {
        "ls /": "/generated/root.html",
        "ls /posts": "/generated/posts.html",
        "cat /posts/typescript-notes.md": "/generated/typescript-notes-view.html",
      },
      get(path: string) {
        return path in this.values ? { existing: true, value: this.values[path] } : { existing: false };
      },
    });
  });

  it("rejects an invalid path without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await CatCommand.init("cat /posts//notes.md", "/posts").execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "error", message: "cat: Invalid path", cwd: "/posts" });
  });

  it("rejects a path that is not in the manifest without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await CatCommand.init("cat missing.md", "/posts").execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      kind: "error",
      message: "cat: Path does not exist: /posts/missing.md",
      cwd: "/posts",
    });
  });

  it("fetches and returns the contents for a resolved file", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<p>notes</p>" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await CatCommand.init("cat typescript-notes.md", "/posts").execute();

    expect(fetchMock).toHaveBeenCalledWith("/generated/typescript-notes-view.html");
    expect(result).toEqual({ kind: "html", html: "<p>notes</p>", cwd: "/posts" });
  });

  it("returns an error when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const result = await CatCommand.init("cat typescript-notes.md", "/posts").execute();

    expect(result).toEqual({ kind: "error", message: "cat: failed to execute command", cwd: "/posts" });
  });

  it("returns an error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await CatCommand.init("cat typescript-notes.md", "/posts").execute();

    expect(result).toEqual({ kind: "error", message: "cat: failed to execute command", cwd: "/posts" });
  });
});