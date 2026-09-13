export interface Frontmatter {
  [key: string]: string;
}

export interface ParsedMarkdown {
  fm: Frontmatter;
  body: string;
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) return { fm: {}, body: raw };

  const [, frontmatter, body] = match;
  const fm: Frontmatter = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    const isQuoted =
      (value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'));
    if (isQuoted) value = value.slice(1, -1);

    fm[key] = value;
  }

  return { fm, body };
}

// TODO: port mdBlocks / inlineSpans from the original DCLogic class
// (the heading/list/code-block tokenizer).

export function toBlocks(_body: string): unknown[] {
  return [];
}