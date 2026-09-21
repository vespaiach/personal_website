import { posix } from "node:path";
import { escapeHtml } from "../lib/markedFragment.ts";
import type { Source } from "./collect.ts";

export const SITE_NAME = "vespaiach.com";

export interface Page {
  title: string;
  description?: string;
  pagePath: string;
  active: string;
  command: string;
  viewHtml: string;
}

export function pagePathFor(source: Source): string {
  const relativePath = source.virtualPath.slice(1);
  if (source.type === "folder") return posix.join(relativePath, "index.html");
  return relativePath.replace(/\.[^./]+$/, ".html");
}

export function pageUrl(pagePath: string): string {
  return encodeURI(`https://${SITE_NAME}/${pagePath.replace(/(^|\/)index\.html$/, "$1")}`);
}

function replaceAnchor(html: string, anchor: RegExp, replacement: (match: string) => string): string {
  if (!anchor.test(html)) throw new Error(`content-views: index.html no longer contains ${anchor}.`);
  return html.replace(anchor, replacement);
}

function renderHead(page: Page): string {
  const tags = [`<title>${escapeHtml(page.title)}</title>`];
  if (page.description) tags.push(`<meta name="description" content="${escapeHtml(page.description)}" />`);
  tags.push(`<link rel="canonical" href="${escapeHtml(pageUrl(page.pagePath))}" />`);
  return tags.join("\n    ");
}

function renderStaticCommandLine(command: string, viewHtml: string): string {
  return (
    '<section class="command-line-section" x-show="!$store.prompts.cleared">' +
    '<div class="command-line">' +
    '<span class="command-line__user">[&gt;_]</span>' +
    '<span class="command-line__separator">in</span>' +
    '<span class="command-line__path">/</span>' +
    '<span class="command-line__symbol">$</span>' +
    `<span class="command-line__command">${escapeHtml(command)}</span>` +
    "</div>" +
    `<div class="command-line__output"><div>${viewHtml}</div></div>` +
    "</section>"
  );
}

export function renderPage(template: string, page: Page): string {
  const withHead = replaceAnchor(template, /<title>[^<]*<\/title>/, () => renderHead(page));
  const withActiveLink = replaceAnchor(withHead, /active="[^"]*"/, () => `active="${page.active}"`);
  return replaceAnchor(
    withActiveLink,
    /<main\b[^>]*>/,
    (mainTag) => `${mainTag}\n      ${renderStaticCommandLine(page.command, page.viewHtml)}`,
  );
}