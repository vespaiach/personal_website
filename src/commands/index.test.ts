import { vi } from "vitest";

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