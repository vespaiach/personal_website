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
  return { default: { store: vi.fn() } };
});

const { ContactCommand } = await import("./ContactCommand.ts");

describe("ContactCommand", () => {
  it("returns a contact result for the current cwd", async () => {
    await expect(ContactCommand.init("contact", "/posts").execute()).resolves.toEqual({
      kind: "contact",
      cwd: "/posts",
    });
  });
});