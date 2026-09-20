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
const { ResumeCommand } = await import("./ResumeCommand.ts");

function stubManifest(values: Record<string, string>) {
  Alpine.store("manifest", {
    values,
    get(path: string) {
      return path in this.values ? { existing: true, value: this.values[path] } : { existing: false };
    },
  });
}

describe("ResumeCommand", () => {
  beforeEach(() => {
    stubManifest({
      "ls /about": "/generated/about-listing.html",
      "cat /about/resume.md": "/generated/resume-view.html",
    });
  });

  it("exposes the expected command metadata", () => {
    expect(ResumeCommand.syntax).toBe("resume");
    expect(ResumeCommand.description).toBe("Print my resume from anywhere: cd ~/about && cat resume.md.");
  });

  it.each(["/", "/posts", "/topics/javascript", "/about", "/about/projects"])(
    "prints the resume and leaves the working directory at /about when run from %s",
    async (cwd) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, text: async () => "<article>resume</article>" });
      vi.stubGlobal("fetch", fetchMock);

      const result = await ResumeCommand.init("resume", cwd).execute();

      expect(fetchMock).toHaveBeenCalledWith("/generated/resume-view.html");
      expect(result).toEqual({ kind: "html", html: "<article>resume</article>", cwd: "/about" });
    },
  );

  it("returns the cd error and keeps the working directory when /about cannot be entered", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    stubManifest({ "cat /about/resume.md": "/generated/resume-view.html" });

    const result = await ResumeCommand.init("resume", "/posts").execute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "error", message: "Path does not exist: /about", cwd: "/posts" });
  });

  it("returns a cat error when the resume view is missing from the manifest", async () => {
    vi.stubGlobal("fetch", vi.fn());
    stubManifest({ "ls /about": "/generated/about-listing.html" });

    const result = await ResumeCommand.init("resume", "/posts").execute();

    expect(result).toEqual({
      kind: "error",
      message: "cat: Path does not exist: /about/resume.md",
      cwd: "/about",
    });
  });

  it("returns an error when the resume view fails to load", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const result = await ResumeCommand.init("resume", "/").execute();

    expect(result).toEqual({ kind: "error", message: "cat: failed to execute command", cwd: "/about" });
  });
});