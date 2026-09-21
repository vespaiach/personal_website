import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Source } from "./collect.ts";
import { type Page, pagePathFor, renderPage } from "./renderPage.ts";

const TEMPLATE = readFileSync(new URL("../../index.html", import.meta.url), "utf-8");

function fileSource(virtualPath: string): Source {
  return { type: "file", virtualPath, filePath: `/content${virtualPath}`, kind: "markdown" };
}

function folderSource(virtualPath: string): Source {
  return { type: "folder", virtualPath, entries: [] };
}

const PAGE: Page = {
  title: "About Me",
  pagePath: "about/me.html",
  active: "about",
  command: "cat /about/me.md",
  viewHtml: '<article class="content-view">hello</article>',
};

describe("pagePathFor", () => {
  it("swaps the last extension of a file for .html", () => {
    expect(pagePathFor(fileSource("/about/me.md"))).toBe("about/me.html");
    expect(pagePathFor(fileSource("/about/stack.json"))).toBe("about/stack.html");
    expect(pagePathFor(fileSource("/about/projects/vespaiach.com.md"))).toBe(
      "about/projects/vespaiach.com.html",
    );
  });

  it("maps a folder to its index.html", () => {
    expect(pagePathFor(folderSource("/about"))).toBe("about/index.html");
    expect(pagePathFor(folderSource("/topics/javascript"))).toBe("topics/javascript/index.html");
    expect(pagePathFor(folderSource("/"))).toBe("index.html");
  });
});

describe("renderPage", () => {
  it("replaces the title with the page's head tags", () => {
    const html = renderPage(TEMPLATE, PAGE);

    expect(html).toContain("<title>About Me - vespaiach.com</title>");
    expect(html).toContain('<link rel="canonical" href="https://vespaiach.com/about/me.html" />');
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html.indexOf('<script type="application/ld+json">')).toBeLessThan(html.indexOf("</head>"));
  });

  it("points the header partial at the page's section and keeps every load tag", () => {
    const html = renderPage(TEMPLATE, PAGE);

    expect(html).toContain('<load src="partials/header.html" active="about" />');
    expect(html.match(/<load /g)).toHaveLength(TEMPLATE.match(/<load /g)?.length ?? 0);
  });

  it("injects the view under a static prompt line before the prompts template", () => {
    const html = renderPage(TEMPLATE, PAGE);

    const section = html.indexOf('<section class="command-line-section" x-show="!$store.prompts.cleared">');
    expect(section).toBeGreaterThan(html.indexOf("<main "));
    expect(section).toBeLessThan(html.indexOf("<template x-for"));
    expect(html).toContain('<span class="command-line__command">cat /about/me.md</span>');
    expect(html).toContain(`<div class="command-line__output"><div>${PAGE.viewHtml}</div></div>`);
  });

  it("keeps replacement patterns inside the view verbatim", () => {
    const viewHtml = '<article>StrongPa$$word123 $1 $& active="topics"</article>';

    const html = renderPage(TEMPLATE, { ...PAGE, viewHtml });

    expect(html).toContain(viewHtml);
    expect(html).toContain('<load src="partials/header.html" active="about" />');
  });

  it("throws when the template lost one of its anchors", () => {
    expect(() => renderPage(TEMPLATE.replace(/<title>[^<]*<\/title>/, ""), PAGE)).toThrow("index.html");
    expect(() => renderPage(TEMPLATE.replace(/<main\b/, "<div"), PAGE)).toThrow("index.html");
  });
});