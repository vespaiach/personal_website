import { describe, expect, it, vi } from "vitest";
import flattenPages from "./flattenPages.ts";

type GenerateBundle = (
  this: { emitFile: (file: unknown) => void },
  options: unknown,
  bundle: Record<string, unknown>,
) => void;

function runGenerateBundle(bundle: Record<string, unknown>) {
  const emitFile = vi.fn();
  const generateBundle = flattenPages().generateBundle as unknown as GenerateBundle;
  generateBundle.call({ emitFile }, {}, bundle);
  return emitFile;
}

describe("flattenPages", () => {
  it("runs after vite's own html plugin, on build only", () => {
    const plugin = flattenPages();

    expect(plugin.enforce).toBe("post");
    expect(plugin.apply).toBe("build");
  });

  it("re-emits assets under pages/ without the prefix and deletes the originals", () => {
    const bundle: Record<string, unknown> = {
      "pages/about/me.html": { type: "asset", fileName: "pages/about/me.html", source: "<html>me</html>" },
      "pages/index.html": { type: "asset", fileName: "pages/index.html", source: "<html>home</html>" },
    };

    const emitFile = runGenerateBundle(bundle);

    expect(emitFile).toHaveBeenCalledWith({
      type: "asset",
      fileName: "about/me.html",
      source: "<html>me</html>",
    });
    expect(emitFile).toHaveBeenCalledWith({
      type: "asset",
      fileName: "index.html",
      source: "<html>home</html>",
    });
    expect(Object.keys(bundle)).toEqual([]);
  });

  it("leaves chunks and assets outside pages/ untouched", () => {
    const bundle: Record<string, unknown> = {
      "assets/main.css": { type: "asset", fileName: "assets/main.css", source: "body{}" },
      "pages/about/me.js": { type: "chunk", fileName: "pages/about/me.js", code: "" },
    };

    const emitFile = runGenerateBundle(bundle);

    expect(emitFile).not.toHaveBeenCalled();
    expect(Object.keys(bundle)).toEqual(["assets/main.css", "pages/about/me.js"]);
  });
});