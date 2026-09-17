import { afterEach, describe, expect, it, vi } from "vitest";
import { CatCommand } from "./CatCommand.ts";

describe("CatCommand", () => {
  const cat = new CatCommand();
  const context = { cwd: "/posts", section: "posts" as const };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects a missing arg", () => {
    expect(cat.validate(undefined)).toEqual({ valid: false, error: "Usage: cat <file_path>" });
  });

  it("accepts a present arg", () => {
    expect(cat.validate("typescript-notes.md")).toEqual({ valid: true });
  });

  it("resolves a relative arg against cwd and fetches its slug", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<article>notes</article>" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await cat.execute("typescript-notes.md", context);

    expect(fetchMock).toHaveBeenCalledWith("/src/generated/typescript-notes-view.html");
    expect(result).toEqual({ kind: "html", html: "<article>notes</article>" });
  });

  it("resolves an absolute arg", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<article>me</article>" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await cat.execute("/about/me.md", context);

    expect(fetchMock).toHaveBeenCalledWith("/src/generated/me-view.html");
    expect(result).toEqual({ kind: "html", html: "<article>me</article>" });
  });

  it("strips only the last extension from a dotted filename", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<article>project</article>" });
    vi.stubGlobal("fetch", fetchMock);

    await cat.execute("/about/projects/vespaiach.com.md", context);

    expect(fetchMock).toHaveBeenCalledWith("/src/generated/vespaiach.com-view.html");
  });

  it("returns an error on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "" }));

    const result = await cat.execute("does-not-exist.md", context);

    expect(result).toEqual({
      kind: "error",
      message: "cat: /posts/does-not-exist.md: No such file or directory",
    });
  });

  it("returns an error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await cat.execute("typescript-notes.md", context);

    expect(result).toEqual({ kind: "error", message: "cat: failed to load '/posts/typescript-notes.md'" });
  });

  it("does not special-case stack.json (known limitation: no codegen for it yet)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "" }));

    const result = await cat.execute("/about/stack.json", context);

    expect(result).toEqual({ kind: "error", message: "cat: /about/stack.json: No such file or directory" });
  });
});