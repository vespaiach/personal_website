import { type CodeToken, tokenizeCode } from "./highlight.ts";

export interface Frontmatter {
  [key: string]: string;
}

export interface ParsedMarkdown {
  fm: Frontmatter;
  body: string;
}

export type InlineSpan =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "em"; text: string }
  | { kind: "link"; text: string; href: string };

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; spans: InlineSpan[] }
  | { kind: "code"; lang: string; lines: CodeToken[][] }
  | { kind: "list"; items: { marker: string; spans: InlineSpan[] }[] }
  | { kind: "hr" };

export function parseFrontmatter(raw: string): ParsedMarkdown {
  const text = raw.replace(/\r/g, "");
  const rows = text.split("\n");
  if ((rows[0] ?? "").trim() !== "---") return { fm: {}, body: text };

  let end = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end < 0) return { fm: {}, body: text };

  const fm: Frontmatter = {};
  for (const row of rows.slice(1, end)) {
    const match = row.match(/^([A-Za-z][\w]*):\s*([\s\S]*)$/);
    if (match) fm[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return { fm, body: rows.slice(end + 1).join("\n") };
}

const INLINE_RE = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\n]+)\*|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)\]]+)/g;

function inlineSpans(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  const push = (span: InlineSpan) => {
    if (span.text) spans.push(span);
  };

  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  // biome-ignore lint/suspicious/noAssignInExpressions: mirrors the ported reference tokenizer's loop shape
  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) push({ kind: "text", text: text.slice(last, m.index) });
    if (m[1] != null) push({ kind: "code", text: m[1] });
    else if (m[2] != null) push({ kind: "strong", text: m[2] });
    else if (m[3] != null) push({ kind: "em", text: m[3] });
    else if (m[4] != null) push({ kind: "link", text: m[4], href: m[5] });
    else push({ kind: "link", text: m[6] ?? "", href: m[6] ?? "" });
    last = m.index + m[0].length;
  }
  if (last < text.length) push({ kind: "text", text: text.slice(last) });
  return spans;
}

export function toBlocks(body: string): Block[] {
  const rows = body.replace(/\r/g, "").split("\n");
  const out: Block[] = [];
  let list: { kind: "list"; items: { marker: string; spans: InlineSpan[] }[] } | null = null;
  let para: string[] | null = null;

  const flushPara = () => {
    if (para) {
      out.push({ kind: "paragraph", spans: inlineSpans(para.join(" ")) });
      para = null;
    }
  };
  const flushList = () => {
    if (list) {
      out.push(list);
      list = null;
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
  };

  let i = 0;
  while (i < rows.length) {
    const raw = rows[i];
    const trimmed = raw.trim();

    if (/^```/.test(trimmed)) {
      flushAll();
      const lang = trimmed.replace(/^`+/, "").trim();
      const buf: string[] = [];
      i++;
      while (i < rows.length && !/^```/.test(rows[i].trim())) {
        buf.push(rows[i]);
        i++;
      }
      i++;
      while (buf.length && !buf[buf.length - 1].trim()) buf.pop();
      out.push({ kind: "code", lang, lines: tokenizeCode(buf.join("\n"), lang) });
      continue;
    }

    if (!trimmed) {
      flushPara();
      i++;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushAll();
      const depth = heading[1].length;
      const level = depth <= 1 ? 1 : depth === 2 ? 2 : 3;
      out.push({ kind: "heading", level, text: heading[2].replace(/\s*#+\s*$/, "").trim() });
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushAll();
      out.push({ kind: "hr" });
      i++;
      continue;
    }

    const unordered = raw.match(/^\s*[-*+]\s+(.*)$/);
    const ordered = raw.match(/^\s*(\d+)\.\s+(.*)$/);
    if (unordered || ordered) {
      flushPara();
      if (!list) list = { kind: "list", items: [] };
      const marker = unordered ? "-" : `${ordered?.[1]}.`;
      const itemText = unordered ? unordered[1] : (ordered?.[2] ?? "");
      list.items.push({ marker, spans: inlineSpans(itemText.trim()) });
      i++;
      continue;
    }

    if (/^\s*>\s?/.test(trimmed)) {
      flushAll();
      out.push({ kind: "paragraph", spans: inlineSpans(trimmed.replace(/^\s*>\s?/, "")) });
      i++;
      continue;
    }

    flushList();
    if (!para) para = [];
    para.push(trimmed);
    i++;
  }

  flushAll();
  return out;
}