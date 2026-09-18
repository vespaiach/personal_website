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

const { ClearCommand } = await import("./ClearCommand.ts");

describe("ClearCommand", () => {
  it("exposes the expected command metadata", () => {
    expect(ClearCommand.syntax).toBe("clear");
    expect(ClearCommand.description).toBe("Clear the terminal output log.");
  });

  it("returns a clear result for the current working directory", async () => {
    const command = ClearCommand.init("clear", "/posts");

    await expect(command.execute()).resolves.toEqual({
      kind: "clear",
      cwd: "/posts",
    });
  });

  it("keeps the working directory unchanged when clearing output", async () => {
    const command = ClearCommand.init("clear", "/");

    const result = await command.execute();

    expect(result).toEqual({
      kind: "clear",
      cwd: "/",
    });
  });
});