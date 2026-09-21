import { posix } from "node:path";
import { escapeHtml } from "../lib/markedFragment.ts";
import type { Source } from "./collect.ts";
import { type HeadMeta, renderHead } from "./renderHead.ts";

export interface Page extends HeadMeta {
  active: string;
  command: string;
  viewHtml: string;
}

export function pagePathFor(source: Source): string {
  const relativePath = source.virtualPath.slice(1);
  if (source.type === "folder") return posix.join(relativePath, "index.html");
  return relativePath.replace(/\.[^./]+$/, ".html");
}

function replaceAnchor(html: string, anchor: RegExp, replacement: (match: string) => string): string {
  if (!anchor.test(html)) throw new Error(`content-views: index.html no longer contains ${anchor}.`);
  return html.replace(anchor, replacement);
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
  const withActiveLink = replaceAnchor(template, /active="[^"]*"/, () => `active="${page.active}"`);
  const withHead = replaceAnchor(withActiveLink, /<title>[^<]*<\/title>/, () => renderHead(page));
  return replaceAnchor(
    withHead,
    /<main\b[^>]*>/,
    (mainTag) => `${mainTag}\n      ${renderStaticCommandLine(page.command, page.viewHtml)}`,
  );
}