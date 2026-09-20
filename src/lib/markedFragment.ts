import { marked } from "marked";
import { codeToHtml, createCssVariablesTheme } from "shiki";
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

const ICON_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="code-block__icon">';

const COPY_ICON = `${ICON_OPEN}<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`;

const CHECK_ICON = `${ICON_OPEN}<path d="M20 6 9 17l-5-5"></path></svg>`;

function extractShikiCode(html: string): string {
  const match = html.match(/<code>([\s\S]*)<\/code>/);
  return match ? match[1] : html;
}

function wrapCodeChrome(lang: string, innerCodeHtml: string): string {
  return (
    '<div data-code-block x-data="{ copied: false }" class="code-block">' +
    '<div class="code-block__header">' +
    `<span class="code-block__lang">${escapeHtml(lang)}</span>` +
    '<span class="code-block__spacer"></span>' +
    '<button type="button" class="code-block__copy" :class="{ \'code-block__copy--copied\': copied }" ' +
    "@click=\"copied = true; setTimeout(() => copied = false, 1200); navigator.clipboard.writeText($el.closest('[data-code-block]').querySelector('code').innerText)\">" +
    `<span class="code-block__state" x-show="!copied">${COPY_ICON}copy</span>` +
    `<span class="code-block__state" x-show="copied">${CHECK_ICON}copied</span>` +
    "</button>" +
    "</div>" +
    '<pre class="code-block__pre">' +
    `<code>${innerCodeHtml}</code></pre>` +
    "</div>"
  );
}

const shikiTheme = createCssVariablesTheme({
  variableDefaults: {
    foreground: "var(--text-body)",
    "token-comment": "var(--syn-comment)",
    "token-keyword": "var(--syn-keyword)",
    "token-string": "var(--syn-string)",
    "token-string-expression": "var(--syn-string)",
    "token-constant": "var(--syn-number)",
    "token-function": "var(--syn-function)",
    "token-parameter": "var(--text-body)",
    "token-punctuation": "var(--text-body)",
    "token-link": "var(--link)",
  },
});

const shikiHtmlByToken = new WeakMap<object, string>();

marked.use({
  async: true,
  async walkTokens(token) {
    if (token.type !== "code") return;
    const lang = (token.lang || "text").split(/\s+/)[0] || "text";
    try {
      shikiHtmlByToken.set(token, await codeToHtml(token.text, { lang, theme: shikiTheme }));
    } catch {
      shikiHtmlByToken.set(token, await codeToHtml(token.text, { lang: "text", theme: shikiTheme }));
    }
  },
  renderer: {
    code(token) {
      return wrapCodeChrome(token.lang || "text", extractShikiCode(shikiHtmlByToken.get(token) ?? ""));
    },
    heading(token) {
      const content = this.parser.parseInline(token.tokens);
      if (token.depth === 1) return `<h2 class="md-h1">${content}</h2>`;
      if (token.depth === 2) return `<h2 class="md-h2">${content}</h2>`;
      return `<h3 class="md-h3">${content}</h3>`;
    },
    paragraph(token) {
      return `<p class="md-p">${this.parser.parseInline(token.tokens)}</p>`;
    },
    codespan(token) {
      return `<code class="md-codespan">${escapeHtml(token.text)}</code>`;
    },
    link(token) {
      return `<a href="${escapeHtml(token.href)}" target="_blank" rel="noreferrer">${this.parser.parseInline(token.tokens)}</a>`;
    },
    hr() {
      return '<hr class="md-hr">';
    },
    blockquote(token) {
      return `<div class="md-blockquote">${this.parser.parse(token.tokens)}</div>`;
    },
    list(token) {
      const start = token.ordered && typeof token.start === "number" ? token.start : 1;
      const rows = token.items
        .map((item, index) => {
          const marker = token.ordered ? `${start + index}.` : "-";
          const content = this.parser.parse(item.tokens);
          return (
            '<div class="md-list__row">' +
            `<span class="md-list__marker">${marker}</span>` +
            `<span class="md-list__content">${content}</span></div>`
          );
        })
        .join("");
      return `<div class="md-list">${rows}</div>`;
    },
  },
});

export function renderSourceFooter(source: string): string {
  if (!source) return "";

  return (
    '<div class="content-view__footer">' +
    '<hr class="view-rule">' +
    '<div class="content-view__source">' +
    `source: <a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">${escapeHtml(source)}</a></div>` +
    "</div>"
  );
}

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

  const tagPills = tags.map((tag) => `<span class="content-view__tag">#${escapeHtml(tag)}</span>`).join("");

  const leadHtml = lead ? `<p class="content-view__lead">${escapeHtml(lead)}</p>` : "";

  const footerHtml = renderSourceFooter(source);
  const bodyHtml = await marked.parse(body, { async: true });

  return (
    '<article class="content-view">' +
    '<header class="content-view__header">' +
    `<div class="view-eyebrow">${escapeHtml(eyebrow)}</div>` +
    `<h1 class="content-view__title">${escapeHtml(title)}</h1>` +
    '<div class="content-view__meta-row">' +
    `<span class="content-view__meta">${escapeHtml(meta)}</span>${tagPills}` +
    "</div>" +
    '<hr class="content-view__header-rule">' +
    `${leadHtml}` +
    "</header>" +
    `${bodyHtml}${footerHtml}` +
    "</article>"
  );
}

export async function renderJsonView(raw: string, eyebrow: string): Promise<string> {
  const html = await codeToHtml(raw, { lang: "json", theme: shikiTheme });
  return (
    '<article class="content-view">' +
    `<div class="view-eyebrow">${escapeHtml(eyebrow)}</div>` +
    `${wrapCodeChrome("json", extractShikiCode(html))}` +
    "</article>"
  );
}