import { describe, expect, it, vi } from "vitest";

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

vi.mock("alpinejs", () => ({
  default: {
    store() {
      return undefined;
    },
  },
}));

const { execute } = await import("./index.ts");

describe("execute", () => {
  it("dispatches a known command to its command class", async () => {
    await expect(execute("clear", "/posts")).resolves.toEqual({ kind: "clear", cwd: "/posts" });
  });

  it("ignores surrounding whitespace when picking the command", async () => {
    await expect(execute("  clear  ", "/")).resolves.toEqual({ kind: "clear", cwd: "/" });
  });

  it("returns an error for an unknown command and keeps the working directory", async () => {
    await expect(execute("rm -rf /", "/topics")).resolves.toEqual({
      kind: "error",
      message: "Unknown command",
      cwd: "/topics",
    });
  });
});