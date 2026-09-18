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

const { execute } = await import("./index.ts");

describe("commands registry", () => {
  it("returns an error result for an unknown command", async () => {
    expect(await execute("whoami", "/")).toEqual({
      kind: "error",
      message: "Unknown command",
      cwd: "/",
    });
  });
});