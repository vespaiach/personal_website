export interface CodeToken {
  text: string;
  tone: "plain" | "comment" | "string" | "number" | "keyword" | "fn";
}

const JS_KW = (
  "const let var function return if else for while do switch case break continue new class extends implements import export from as default " +
  "type interface enum declare namespace public private protected readonly static async await yield throw try catch finally typeof instanceof in of " +
  "delete void satisfies keyof infer never unknown any string number boolean object symbol null undefined true false this super"
).split(" ");

const SH_KW = (
  "sudo brew apt apt-get yum echo export cd ls cat curl wget chmod chown mkdir rm cp mv grep sed awk tar ssh scp systemctl service launchctl " +
  "npm npx yarn pnpm node git docker if then fi for do done while function local set source dig nslookup ping ifconfig ipconfig"
).split(" ");

const SHELL_LANGS = /^(bash|sh|shell|zsh|conf|config|base|ini|txt|text|yaml|yml|nginx|plain|)$/;

export function tokenizeCode(code: string, lang: string): CodeToken[][] {
  const isShell = SHELL_LANGS.test(String(lang || "").toLowerCase());
  const keywords = isShell ? SH_KW : JS_KW;
  const tokenRe = isShell
    ? /(#[^\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\d+(?:\.\d+)+|\b\d+\b)|([A-Za-z_][\w-]*)/g
    : /(\/\/[^\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

  return code.split("\n").map((row) => {
    if (!isShell && /^\s*(\/\*|\*\/|\*\s|\*$)/.test(row)) {
      return [{ text: row, tone: "comment" as const }];
    }

    const out: CodeToken[] = [];
    const add = (text: string, tone: CodeToken["tone"]) => {
      if (text) out.push({ text, tone });
    };

    let last = 0;
    let m: RegExpExecArray | null;
    tokenRe.lastIndex = 0;
    // biome-ignore lint/suspicious/noAssignInExpressions: mirrors the ported reference tokenizer's loop shape
    while ((m = tokenRe.exec(row))) {
      add(row.slice(last, m.index), "plain");
      if (m[1] != null) add(m[1], "comment");
      else if (m[2] != null) add(m[2], "string");
      else if (m[3] != null) add(m[3], "number");
      else {
        const word = m[4] ?? "";
        if (keywords.includes(word)) add(word, "keyword");
        else if (row.charAt(m.index + word.length) === "(") add(word, "fn");
        else add(word, "plain");
      }
      last = m.index + m[0].length;
    }
    add(row.slice(last), "plain");

    return out.length ? out : [{ text: "", tone: "plain" as const }];
  });
}