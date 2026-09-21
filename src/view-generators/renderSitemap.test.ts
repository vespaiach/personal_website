import { describe, expect, it } from "vitest";
import { renderSitemap } from "./renderSitemap.ts";

describe("renderSitemap", () => {
  it("renders a urlset sorted by url", () => {
    const xml = renderSitemap([
      { url: "https://vespaiach.com/posts/" },
      { url: "https://vespaiach.com/" },
      { url: "https://vespaiach.com/about/me.html" },
    ]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.match(/<loc>[^<]*/g)).toEqual([
      "<loc>https://vespaiach.com/",
      "<loc>https://vespaiach.com/about/me.html",
      "<loc>https://vespaiach.com/posts/",
    ]);
  });

  it("adds lastmod only to entries that have one", () => {
    const xml = renderSitemap([
      { url: "https://vespaiach.com/posts/typescript-notes.html", lastmod: "2025-03-23" },
      { url: "https://vespaiach.com/posts/" },
    ]);

    expect(xml).toContain(
      "<url><loc>https://vespaiach.com/posts/typescript-notes.html</loc><lastmod>2025-03-23</lastmod></url>",
    );
    expect(xml).toContain("<url><loc>https://vespaiach.com/posts/</loc></url>");
  });

  it("escapes xml-special characters in urls", () => {
    const xml = renderSitemap([{ url: "https://vespaiach.com/topics/c&c/" }]);

    expect(xml).toContain("<loc>https://vespaiach.com/topics/c&amp;c/</loc>");
  });
});