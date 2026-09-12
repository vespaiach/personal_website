export interface CodeToken {
  text: string;
  tone: "plain" | "comment" | "string" | "number" | "keyword" | "fn";
}

// TODO: port the JS_KW/SH_KW keyword-list tokenizer from the original
// CodeBlock rendering logic.
export function tokenizeCode(code: string, _lang: string): CodeToken[][] {
  return code.split("\n").map((line) => [{ text: line, tone: "plain" }]);
}