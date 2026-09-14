import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "vite-plugins/**/*.test.ts"],
  },
});
