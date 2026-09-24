import { marked } from "marked";
import { codeToHtml, createCssVariablesTheme } from "shiki";
import { type Frontmatter, parseFrontmatter } from "./markdown.ts";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function resolveTitle(fm: Frontmatter, body: string): { title: string; body: string } {
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

const ACTION_STROKE_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';

const ACTION_BRAND_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">';

const X_ICON = `${ACTION_BRAND_OPEN}<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path></svg>`;

const LINKEDIN_ICON = `${ACTION_BRAND_OPEN}<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"></path></svg>`;

const BLUESKY_ICON = `${ACTION_BRAND_OPEN}<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"></path></svg>`;

const MAIL_ICON = `${ACTION_STROKE_OPEN}<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`;

const LINK_ICON = `${ACTION_STROKE_OPEN}<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;

const COPIED_ICON = `${ACTION_STROKE_OPEN}<path d="M20 6 9 17l-5-5"></path></svg>`;

const FULLSCREEN_ICON = `${ACTION_STROKE_OPEN}<path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>`;

function actionLink(href: string, label: string, icon: string): string {
  return (
    `<a class="content-view__action" href="${escapeHtml(href)}" target="_blank" rel="noreferrer" ` +
    `title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${icon}</a>`
  );
}

function renderActions(title: string, url: string): string {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    '<div class="content-view__actions" x-data="{ copied: false }">' +
    actionLink(`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "Share on X", X_ICON) +
    actionLink(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      "Share on LinkedIn",
      LINKEDIN_ICON,
    ) +
    actionLink(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}`,
      "Share on Bluesky",
      BLUESKY_ICON,
    ) +
    `<a class="content-view__action" href="${escapeHtml(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`)}" ` +
    'title="Share by email" aria-label="Share by email">' +
    `${MAIL_ICON}</a>` +
    '<button type="button" class="content-view__action" :title="copied ? \'Link copied\' : \'Copy link\'" ' +
    ":aria-label=\"copied ? 'Link copied' : 'Copy link'\" " +
    `@click="copied = true; setTimeout(() => copied = false, 1200); navigator.clipboard.writeText('${escapeHtml(url)}')">` +
    `<span x-show="!copied">${LINK_ICON}</span><span x-show="copied">${COPIED_ICON}</span>` +
    "</button>" +
    '<button type="button" class="content-view__action" title="View full screen" aria-label="View full screen" ' +
    "@click=\"document.fullscreenElement ? document.exitFullscreen() : $el.closest('.content-view').requestFullscreen()\">" +
    `${FULLSCREEN_ICON}</button>` +
    "</div>"
  );
}

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

export async function renderMarkdownView(raw: string, eyebrow: string, url: string): Promise<string> {
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
    renderActions(title, url) +
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