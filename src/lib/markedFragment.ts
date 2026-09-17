import { marked } from "marked";
import { codeToHtml } from "shiki";
import { type Frontmatter, parseFrontmatter } from "./markdown.ts";

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

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display: block; flex: 0 0 auto;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';

function extractShikiCode(html: string): string {
  const match = html.match(/<code>([\s\S]*)<\/code>/);
  return match ? match[1] : html;
}

function wrapCodeChrome(lang: string, innerCodeHtml: string): string {
  return (
    '<div data-code-block x-data="{ copied: false }" style="background: var(--canvas-soft); border: 1px solid var(--hairline); border-radius: var(--radius-card); overflow: hidden;">' +
    '<div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px 6px 12px; border-bottom: 1px solid var(--hairline); background: var(--canvas-raised);">' +
    `<span style="font-family: var(--font-code); font-size: var(--caption-size); color: var(--text-mute);">${escapeHtml(lang)}</span>` +
    '<span style="flex: 1 1 0%;"></span>' +
    '<button type="button" style="display: inline-flex; align-items: center; gap: 5px; background: transparent; border: 0; cursor: pointer; padding: 2px 4px; font-family: var(--font-code); font-size: var(--caption-size); color: var(--text-mute);" ' +
    "@click=\"copied = true; setTimeout(() => copied = false, 1500); navigator.clipboard.writeText($el.closest('[data-code-block]').querySelector('code').innerText)\">" +
    `${COPY_ICON}<span x-show="!copied">copy</span><span x-show="copied">copied</span>` +
    "</button>" +
    "</div>" +
    '<pre style="margin: 0; padding: var(--pad-mockup); overflow-x: auto; font-family: var(--font-code); font-size: var(--code-size); line-height: var(--code-leading); color: var(--text-body);">' +
    `<code>${innerCodeHtml}</code></pre>` +
    "</div>"
  );
}

const shikiHtmlByToken = new WeakMap<object, string>();

marked.use({
  async: true,
  async walkTokens(token) {
    if (token.type !== "code") return;
    const lang = (token.lang || "text").split(/\s+/)[0] || "text";
    try {
      shikiHtmlByToken.set(token, await codeToHtml(token.text, { lang, theme: "nord" }));
    } catch {
      shikiHtmlByToken.set(token, await codeToHtml(token.text, { lang: "text", theme: "nord" }));
    }
  },
  renderer: {
    code(token) {
      return wrapCodeChrome(token.lang || "text", extractShikiCode(shikiHtmlByToken.get(token) ?? ""));
    },
    heading(token) {
      const content = this.parser.parseInline(token.tokens);
      if (token.depth <= 2) {
        return `<h2 style="margin: 14px 0 0; font-size: 24px; line-height: 32px; letter-spacing: -0.4px; font-weight: 500; color: var(--ink);">${content}</h2>`;
      }
      return `<h3 style="margin: 12px 0 0; font-size: 20px; line-height: 28px; font-weight: 500; color: var(--ink);">${content}</h3>`;
    },
    paragraph(token) {
      return `<p style="margin: 0; font-size: 16px; line-height: 26px; color: var(--text-body);">${this.parser.parseInline(token.tokens)}</p>`;
    },
    codespan(token) {
      return `<code style="background: var(--canvas-raised); padding: 1px 5px; border-radius: var(--radius-sm); color: var(--text-strong);">${escapeHtml(token.text)}</code>`;
    },
    link(token) {
      return `<a href="${escapeHtml(token.href)}" target="_blank" rel="noreferrer">${this.parser.parseInline(token.tokens)}</a>`;
    },
    hr() {
      return '<hr style="border: 0; height: 1px; margin: 8px 0; background: var(--hairline);">';
    },
    blockquote(token) {
      return `<div style="border-left: 3px solid var(--hairline); padding-left: 14px; margin: 0; color: var(--text-mute); font-size: 16px; line-height: 26px;">${this.parser.parse(token.tokens)}</div>`;
    },
    list(token) {
      const start = token.ordered && typeof token.start === "number" ? token.start : 1;
      const rows = token.items
        .map((item, index) => {
          const marker = token.ordered ? `${start + index}.` : "-";
          const content = this.parser.parse(item.tokens);
          return (
            '<div style="display: flex; gap: 8px; align-items: baseline;">' +
            `<span style="color: var(--text-mute); font-family: var(--font-code); flex: none;">${marker}</span>` +
            `<span style="color: var(--text-body);">${content}</span></div>`
          );
        })
        .join("");
      return `<div style="display: flex; flex-direction: column; gap: 6px; font-size: 16px; line-height: 26px;">${rows}</div>`;
    },
  },
});

export async function renderMarkdownView(raw: string, eyebrow: string): Promise<string> {
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

  const bodyHtml = await marked.parse(body, { async: true });

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
    `${bodyHtml}${footerHtml}` +
    "</article>"
  );
}

export async function renderJsonView(raw: string, eyebrow: string): Promise<string> {
  const html = await codeToHtml(raw, { lang: "json", theme: "nord" });
  return (
    '<article style="max-width: 720px; display: flex; flex-direction: column; gap: 20px; margin: 16px 0 34px;">' +
    `<div style="font-family: var(--font-code); font-size: 12px; letter-spacing: 0.04em; color: var(--text-faint);">${escapeHtml(eyebrow)}</div>` +
    `${wrapCodeChrome("json", extractShikiCode(html))}` +
    "</article>"
  );
}