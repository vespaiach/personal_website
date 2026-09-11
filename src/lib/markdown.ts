export interface Frontmatter {
  [key: string]: string;
}

export interface ParsedMarkdown {
  fm: Frontmatter;
  body: string;
}

// TODO: port parseFm / mdBlocks / inlineSpans from the original DCLogic
// class (the "---" frontmatter split + heading/list/code-block tokenizer).
export function parseFrontmatter(raw: string): ParsedMarkdown {
  return { fm: {}, body: raw };
}

export function toBlocks(_body: string): unknown[] {
  return [];
}
