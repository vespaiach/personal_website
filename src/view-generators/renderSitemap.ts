import { escapeHtml } from "../lib/markedFragment.ts";

export interface SitemapEntry {
  url: string;
  lastmod?: string;
}

function renderUrl({ url, lastmod }: SitemapEntry): string {
  const lastmodTag = lastmod ? `<lastmod>${escapeHtml(lastmod)}</lastmod>` : "";
  return `  <url><loc>${escapeHtml(url)}</loc>${lastmodTag}</url>`;
}

export function renderSitemap(entries: SitemapEntry[]): string {
  const urls = [...entries].sort((left, right) => left.url.localeCompare(right.url)).map(renderUrl);
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls.join("\n")}\n` +
    "</urlset>\n"
  );
}