import { afterEach, describe, expect, it, vi } from "vitest";
import { LsCommand } from "./LsCommand.ts";

describe("LsCommand", () => {
  const ls = LsCommand.init();
  const context = { cwd: "/posts", section: "posts" as const };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts no arg or an arg", () => {
    expect(ls.validate(undefined)).toEqual({ valid: true });
    expect(ls.validate("/about")).toEqual({ valid: true });
  });

  it("fetches the listing for the current directory when no arg is given", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<ul>posts</ul>" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await LsCommand.init(undefined, context).execute();

    expect(fetchMock).toHaveBeenCalledWith("/src/generated/posts-listing.html");
    expect(result).toEqual({ kind: "html", html: "<ul>posts</ul>" });
  });

  it("resolves a relative arg against cwd before mapping to a listing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<ul>projects</ul>" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await LsCommand.init("../about/projects", { cwd: "/posts", section: "posts" }).execute();

    expect(fetchMock).toHaveBeenCalledWith("/src/generated/projects-listing.html");
    expect(result).toEqual({ kind: "html", html: "<ul>projects</ul>" });
  });

  it("returns an error for a target with no mapped listing, without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await LsCommand.init("typescript-notes.md", context).execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      kind: "error",
      message: "ls: cannot access '/posts/typescript-notes.md': No such directory",
    });
  });

  it("returns an error when the response isn't ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "" }));

    const result = await LsCommand.init(undefined, context).execute();

    expect(result).toEqual({ kind: "error", message: "ls: cannot access '/posts': No such directory" });
  });

  it("returns an error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await LsCommand.init(undefined, context).execute();

    expect(result).toEqual({ kind: "error", message: "ls: failed to load '/posts'" });
  });
});