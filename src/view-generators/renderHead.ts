import { escapeHtml } from "../lib/markedFragment.ts";

export const SITE_NAME = "vespaiach.com";
export const SITE_DESCRIPTION =
  "The terminal-styled dev blog of Trinh Nguyen, a full-stack web developer: notes and tutorials on " +
  "JavaScript, TypeScript, React, Ruby on Rails and servers.";

const SITE_URL = `https://${SITE_NAME}/`;
const WEBSITE_ID = `${SITE_URL}#website`;
const AUTHOR_ID = `${SITE_URL}#author`;
const AUTHOR = {
  name: "Trinh Nguyen",
  jobTitle: "Full-Stack Software Engineer",
  sameAs: ["https://github.com/vespaiach", "https://www.linkedin.com/in/trinh-nguyen-us/"],
};
const SOCIAL_IMAGE = {
  url: `${SITE_URL}og-image.png`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}, the terminal-styled dev blog of ${AUTHOR.name}`,
};
const ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

export interface Article {
  published: string;
  modified: string;
  tags: string[];
}

export interface HeadMeta {
  title: string;
  description?: string;
  pagePath: string;
  canonicalPath?: string;
  article?: Article;
}

export function pageUrl(pagePath: string): string {
  return encodeURI(`${SITE_URL}${pagePath.replace(/(^|\/)index\.html$/, "$1")}`);
}

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text
    .slice(0, limit - 1)
    .replace(/\s+\S*$/, "")
    .replace(/[,;:.]$/, "")}…`;
}

function documentTitle(title: string): string {
  const branded = `${title} - ${SITE_NAME}`;
  return branded.length <= TITLE_LIMIT ? branded : truncate(title, TITLE_LIMIT);
}

function meta(attribute: "name" | "property", key: string, content: string | number): string {
  return `<meta ${attribute}="${key}" content="${escapeHtml(String(content))}" />`;
}

function structuredData(page: HeadMeta, url: string, description?: string): string {
  const graph: object[] = [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": AUTHOR_ID },
    },
    { "@type": "Person", "@id": AUTHOR_ID, url: SITE_URL, ...AUTHOR },
  ];

  if (page.article) {
    graph.push({
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      url,
      mainEntityOfPage: url,
      headline: page.title,
      description,
      image: SOCIAL_IMAGE.url,
      datePublished: page.article.published,
      dateModified: page.article.modified,
      keywords: page.article.tags,
      inLanguage: "en",
      author: { "@id": AUTHOR_ID },
      publisher: { "@id": AUTHOR_ID },
      isPartOf: { "@id": WEBSITE_ID },
    });
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  return `<script type="application/ld+json">${json.replace(/</g, "\\u003c")}</script>`;
}

export function renderHead(page: HeadMeta): string {
  const url = pageUrl(page.canonicalPath ?? page.pagePath);
  const description = page.description && truncate(page.description, DESCRIPTION_LIMIT);
  const article = page.article;

  return [
    `<title>${escapeHtml(documentTitle(page.title))}</title>`,
    description && meta("name", "description", description),
    meta("name", "author", AUTHOR.name),
    meta("name", "robots", ROBOTS),
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    meta("property", "og:site_name", SITE_NAME),
    meta("property", "og:locale", "en_US"),
    meta("property", "og:type", article ? "article" : "website"),
    meta("property", "og:title", page.title),
    description && meta("property", "og:description", description),
    meta("property", "og:url", url),
    meta("property", "og:image", SOCIAL_IMAGE.url),
    meta("property", "og:image:width", SOCIAL_IMAGE.width),
    meta("property", "og:image:height", SOCIAL_IMAGE.height),
    meta("property", "og:image:alt", SOCIAL_IMAGE.alt),
    article && meta("property", "article:published_time", article.published),
    article && meta("property", "article:modified_time", article.modified),
    ...(article?.tags ?? []).map((tag) => meta("property", "article:tag", tag)),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", page.title),
    description && meta("name", "twitter:description", description),
    meta("name", "twitter:image", SOCIAL_IMAGE.url),
    meta("name", "twitter:image:alt", SOCIAL_IMAGE.alt),
    structuredData(page, url, description),
  ]
    .filter(Boolean)
    .join("\n    ");
}