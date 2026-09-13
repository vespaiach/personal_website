import type { CodeToken } from "../src/lib/highlight.ts";
import {
  type Block,
  type Frontmatter,
  type InlineSpan,
  parseFrontmatter,
  toBlocks,
} from "../src/lib/markdown.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveTitle(fm: Frontmatter, body: string): { title: string; body: string } {
  if (fm.title) return { title: fm.title, body };
  const match = body.match(/^#\s+(.+)\n?/);
  if (match) return { title: match[1].trim(), body: body.slice(match[0].length) };
  return { title: "", body };
}

const TONE_COLOR: Record<CodeToken["tone"], string> = {
  plain: "var(--text-body)",
  comment: "var(--syn-comment)",
  string: "var(--syn-string)",
  number: "var(--syn-number)",
  keyword: "var(--syn-keyword)",
  fn: "var(--syn-function)",
};

function renderToken(token: CodeToken): string {
  return `<span style="color: ${TONE_COLOR[token.tone]};">${escapeHtml(token.text)}</span>`;
}

function renderCodeLine(line: CodeToken[]): string {
  return `<div style="display: flex; gap: 16px;"><span style="white-space: pre;">${line.map(renderToken).join("")}</span></div>`;
}

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display: block; flex: 0 0 auto;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';

function renderCode(block: Extract<Block, { kind: "code" }>): string {
  const lang = escapeHtml(block.lang || "text");
  const lines = block.lines.map(renderCodeLine).join("");
  return (
    '<div data-code-block x-data="{ copied: false }" style="background: var(--canvas-soft); border: 1px solid var(--hairline); border-radius: var(--radius-card); overflow: hidden;">' +
    '<div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px 6px 12px; border-bottom: 1px solid var(--hairline); background: var(--canvas-raised);">' +
    `<span style="font-family: var(--font-code); font-size: var(--caption-size); color: var(--text-mute);">${lang}</span>` +
    '<span style="flex: 1 1 0%;"></span>' +
    '<button type="button" style="display: inline-flex; align-items: center; gap: 5px; background: transparent; border: 0; cursor: pointer; padding: 2px 4px; font-family: var(--font-code); font-size: var(--caption-size); color: var(--text-mute);" ' +
    "@click=\"copied = true; setTimeout(() => copied = false, 1500); navigator.clipboard.writeText($el.closest('[data-code-block]').querySelector('code').innerText)\">" +
    `${COPY_ICON}<span x-show="!copied">copy</span><span x-show="copied">copied</span>` +
    "</button>" +
    "</div>" +
    '<pre style="margin: 0; padding: var(--pad-mockup); overflow-x: auto; font-family: var(--font-code); font-size: var(--code-size); line-height: var(--code-leading); color: var(--text-body);">' +
    `<code>${lines}</code></pre>` +
    "</div>"
  );
}

function renderSpan(span: InlineSpan): string {
  const text = escapeHtml(span.text);
  switch (span.kind) {
    case "text":
      return text;
    case "code":
      return `<code style="background: var(--canvas-raised); padding: 1px 5px; border-radius: var(--radius-sm); color: var(--text-strong);">${text}</code>`;
    case "strong":
      return `<strong>${text}</strong>`;
    case "em":
      return `<em>${text}</em>`;
    case "link":
      return `<a href="${escapeHtml(span.href)}" target="_blank" rel="noreferrer">${text}</a>`;
  }
}

function renderSpans(spans: InlineSpan[]): string {
  return spans.map(renderSpan).join("");
}

function renderParagraph(block: Extract<Block, { kind: "paragraph" }>): string {
  return `<p style="margin: 0; font-size: 16px; line-height: 26px; color: var(--text-body);">${renderSpans(block.spans)}</p>`;
}

const HEADING_STYLE: Record<1 | 2 | 3, string> = {
  1: "margin: 14px 0 0; font-size: 24px; line-height: 32px; letter-spacing: -0.4px; font-weight: 500; color: var(--ink);",
  2: "margin: 14px 0 0; font-size: 24px; line-height: 32px; letter-spacing: -0.4px; font-weight: 500; color: var(--ink);",
  3: "margin: 12px 0 0; font-size: 20px; line-height: 28px; font-weight: 500; color: var(--ink);",
};

function renderHeading(block: Extract<Block, { kind: "heading" }>): string {
  const tag = block.level === 3 ? "h3" : "h2";
  return `<${tag} style="${HEADING_STYLE[block.level]}">${escapeHtml(block.text)}</${tag}>`;
}

function renderListItem(item: { marker: string; spans: InlineSpan[] }): string {
  return (
    '<div style="display: flex; gap: 8px; align-items: baseline;">' +
    `<span style="color: var(--text-mute); font-family: var(--font-code); flex: none;">${escapeHtml(item.marker)}</span>` +
    `<span style="color: var(--text-body);">${renderSpans(item.spans)}</span>` +
    "</div>"
  );
}

function renderList(block: Extract<Block, { kind: "list" }>): string {
  return `<div style="display: flex; flex-direction: column; gap: 6px; font-size: 16px; line-height: 26px;">${block.items.map(renderListItem).join("")}</div>`;
}

function renderHr(): string {
  return '<hr style="border: 0; height: 1px; margin: 8px 0; background: var(--hairline);">';
}

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "heading":
      return renderHeading(block);
    case "paragraph":
      return renderParagraph(block);
    case "code":
      return renderCode(block);
    case "list":
      return renderList(block);
    case "hr":
      return renderHr();
  }
}

export function renderMarkdownFragment(raw: string, eyebrow: string): string {
  const { fm, body: rawBody } = parseFrontmatter(raw);
  const { title, body: titledBody } = resolveTitle(fm, rawBody.replace(/^\n+/, ""));
  const body = titledBody.replace(/^\n+/, "");

  const words = body.split(/\s+/).filter(Boolean).length;
  const date = (fm.date ?? "").slice(0, 10);
  const minutes = Math.max(1, Math.round(words / 220));
  const meta = [date, `${words} words`, `${minutes} min read`].filter(Boolean).join("   ·   ");
  const tags = (fm.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const lead = fm.excerpt ?? "";
  const source = fm.github ?? "";
  const blocks = toBlocks(body);

  const tagPills = tags
    .map(
      (tag) =>
        '<span style="display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-code); font-size: var(--caption-size); line-height: 16px; letter-spacing: 0.02em; padding: 2px 8px; border-radius: var(--radius-pill); white-space: nowrap; background: var(--canvas-raised); color: var(--accent); border: 1px solid transparent;">' +
        `#${escapeHtml(tag)}</span>`,
    )
    .join("");

  const leadHtml = lead
    ? `<p style="margin: 0; font-size: 18px; line-height: 30px; color: var(--text-strong);">${escapeHtml(lead)}</p>`
    : "";

  const footerHtml = source
    ? '<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 6px;">' +
      '<hr style="border: 0; height: 1px; margin: 0; background: var(--hairline);">' +
      '<div style="font-family: var(--font-code); font-size: 12px; line-height: 18px; color: var(--text-faint);">' +
      `source: <a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">${escapeHtml(source)}</a></div>` +
      "</div>"
    : "";

  const blocksHtml = blocks.map(renderBlock).join("\n");

  return (
    '<article style="max-width: 720px; display: flex; flex-direction: column; gap: 20px; margin: 16px 0 34px;">' +
    '<header style="display: flex; flex-direction: column; gap: 14px;">' +
    `<div style="font-family: var(--font-code); font-size: 12px; letter-spacing: 0.04em; color: var(--text-faint);">${escapeHtml(eyebrow)}</div>` +
    `<h1 style="margin: 0; font-size: 38px; line-height: 42px; letter-spacing: -0.95px; font-weight: 400; color: var(--ink);">${escapeHtml(title)}</h1>` +
    '<div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">' +
    `<span style="font-family: var(--font-code); font-size: 12px; color: var(--text-mute);">${escapeHtml(meta)}</span>${tagPills}` +
    "</div>" +
    '<hr style="border: 0; height: 1px; margin: 2px 0 0; background: var(--hairline);">' +
    `${leadHtml}` +
    "</header>" +
    `${blocksHtml}${footerHtml}` +
    "</article>"
  );
}