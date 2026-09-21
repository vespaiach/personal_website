import { describe, expect, it } from "vitest";
import { type HeadMeta, pageUrl, renderHead } from "./renderHead.ts";

const PAGE: HeadMeta = {
  title: "About Me",
  description: "Who Trinh Nguyen is.",
  pagePath: "about/me.html",
};

const POST: HeadMeta = {
  title: "Typescript Notes",
  description: "Essential TypeScript concepts.",
  pagePath: "posts/typescript-notes.html",
  article: {
    published: "2025-03-23T00:00:00.000Z",
    modified: "2025-04-01T00:00:00.000Z",
    tags: ["typescript", "notes"],
  },
};

function structuredData(head: string): { "@context": string; "@graph": Array<Record<string, unknown>> } {
  const json = head.match(/<script type="application\/ld\+json">(.*)<\/script>/)?.[1] ?? "";
  return JSON.parse(json);
}

describe("pageUrl", () => {
  it("keeps file names and drops a trailing index.html", () => {
    expect(pageUrl("about/me.html")).toBe("https://vespaiach.com/about/me.html");
    expect(pageUrl("about/index.html")).toBe("https://vespaiach.com/about/");
    expect(pageUrl("index.html")).toBe("https://vespaiach.com/");
  });
});

describe("renderHead", () => {
  it("brands the title and points canonical and og:url at the page", () => {
    const head = renderHead(PAGE);

    expect(head).toContain("<title>About Me - vespaiach.com</title>");
    expect(head).toContain('<link rel="canonical" href="https://vespaiach.com/about/me.html" />');
    expect(head).toContain('<meta property="og:url" content="https://vespaiach.com/about/me.html" />');
    expect(head).toContain('<meta property="og:title" content="About Me" />');
    expect(head).toContain('<meta name="twitter:title" content="About Me" />');
  });

  it("drops the site name, then truncates on a word boundary, to keep the title within 60 characters", () => {
    const unbranded = renderHead({ ...PAGE, title: "JavaScript: Interesting Facts for Web Developers" });
    expect(unbranded).toContain("<title>JavaScript: Interesting Facts for Web Developers</title>");

    const title = "Setting Up a Staging Site for WordPress Without Built-in Staging";
    const truncated = renderHead({ ...PAGE, title });
    expect(truncated).toContain("<title>Setting Up a Staging Site for WordPress Without Built-in…</title>");
    expect(truncated).toContain(`<meta property="og:title" content="${title}" />`);
  });

  it("truncates a long description to 160 characters everywhere it appears", () => {
    const head = renderHead({ ...PAGE, description: "word ".repeat(60).trim() });

    const description = head.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith("word…")).toBe(true);
    expect(head).toContain(`<meta property="og:description" content="${description}" />`);
    expect(head).toContain(`<meta name="twitter:description" content="${description}" />`);
  });

  it("escapes the description and omits its tags when the page has none", () => {
    const head = renderHead({ ...PAGE, description: 'Types like "any" & <never>' });
    expect(head).toContain(
      '<meta name="description" content="Types like &quot;any&quot; &amp; &lt;never&gt;" />',
    );

    const bare = renderHead({ ...PAGE, description: undefined });
    expect(bare).not.toContain('name="description"');
    expect(bare).not.toContain("og:description");
    expect(bare).not.toContain("twitter:description");
  });

  it("lets search engines index the page and share it with a large image card", () => {
    const head = renderHead(PAGE);

    expect(head).toContain('<meta name="robots" content="index, follow, max-image-preview:large,');
    expect(head).toContain('<meta property="og:site_name" content="vespaiach.com" />');
    expect(head).toContain('<meta property="og:type" content="website" />');
    expect(head).toContain('<meta property="og:image" content="https://vespaiach.com/og-image.png" />');
    expect(head).toContain('<meta property="og:image:width" content="1200" />');
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(head).toContain('<meta name="twitter:image" content="https://vespaiach.com/og-image.png" />');
    expect(head).not.toContain("article:");
  });

  it("marks a post as an article with its dates and tags", () => {
    const head = renderHead(POST);

    expect(head).toContain('<meta property="og:type" content="article" />');
    expect(head).toContain('<meta property="article:published_time" content="2025-03-23T00:00:00.000Z" />');
    expect(head).toContain('<meta property="article:modified_time" content="2025-04-01T00:00:00.000Z" />');
    expect(head).toContain('<meta property="article:tag" content="typescript" />');
    expect(head).toContain('<meta property="article:tag" content="notes" />');
  });

  it("uses the canonical path for canonical and og:url when the page duplicates another", () => {
    const head = renderHead({ ...PAGE, pagePath: "posts/index.html", canonicalPath: "index.html" });

    expect(head).toContain('<link rel="canonical" href="https://vespaiach.com/" />');
    expect(head).toContain('<meta property="og:url" content="https://vespaiach.com/" />');
  });

  it("describes the site and its author as structured data on every page", () => {
    const data = structuredData(renderHead(PAGE));

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@graph"].map((node) => node["@type"])).toEqual(["WebSite", "Person"]);
    expect(data["@graph"][0]).toMatchObject({
      url: "https://vespaiach.com/",
      name: "vespaiach.com",
      publisher: { "@id": "https://vespaiach.com/#author" },
    });
    expect(data["@graph"][1]).toMatchObject({ "@id": "https://vespaiach.com/#author", name: "Trinh Nguyen" });
  });

  it("adds a BlogPosting to the structured data of a post", () => {
    const posting = structuredData(renderHead(POST))["@graph"][2];

    expect(posting).toMatchObject({
      "@type": "BlogPosting",
      headline: "Typescript Notes",
      description: "Essential TypeScript concepts.",
      mainEntityOfPage: "https://vespaiach.com/posts/typescript-notes.html",
      datePublished: "2025-03-23T00:00:00.000Z",
      dateModified: "2025-04-01T00:00:00.000Z",
      keywords: ["typescript", "notes"],
      author: { "@id": "https://vespaiach.com/#author" },
    });
  });

  it("keeps a closing script tag in the content from ending the structured data early", () => {
    const head = renderHead({ ...POST, title: "</script><script>alert(1)</script>" });

    expect(head.match(/<\/script>/g)).toHaveLength(1);
    expect(structuredData(head)["@graph"][2].headline).toBe("</script><script>alert(1)</script>");
  });
});