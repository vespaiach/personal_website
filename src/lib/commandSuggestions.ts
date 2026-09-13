export interface Suggestion {
  label: string;
  hint: string;
}

export const RECENT_CAP = 20;

export const FIXED_COMMANDS: ReadonlyArray<readonly [string, string]> = [
  ["ls", "list the current directory"],
  ["cd ~/posts", "the notes"],
  ["cd ~/topics", "one dir per tag"],
  ["cd ~/about", "me.md, stack.json, projects"],
  ["tree ~", "two levels"],
  ["grep -t react", "search by topic"],
  ["whoami", ""],
  ["pwd", ""],
  ["history", ""],
  ["clear", ""],
  ["help", "all commands"],
];

function matches(label: string, query: string): boolean {
  return label.toLowerCase().startsWith(query.toLowerCase());
}

export function buildSuggestions(query: string, recent: readonly string[]): Suggestion[] {
  const trimmed = query.trim();

  if (!trimmed) {
    const recentSuggestions = recent
      .slice(-3)
      .reverse()
      .map((label) => ({ label, hint: "recent" }));
    const fixedSuggestions = FIXED_COMMANDS.slice(0, 8).map(([label, hint]) => ({ label, hint }));
    return recentSuggestions.concat(fixedSuggestions);
  }

  const recentSuggestions = [...recent]
    .reverse()
    .filter((label) => matches(label, trimmed))
    .slice(0, 3)
    .map((label) => ({ label, hint: "recent" }));
  const fixedSuggestions = FIXED_COMMANDS.filter(([label]) => matches(label, trimmed)).map(
    ([label, hint]) => ({ label, hint }),
  );
  return recentSuggestions.concat(fixedSuggestions);
}

export function pushRecent(recent: readonly string[], cmd: string, cap = RECENT_CAP): string[] {
  const next = [...recent, cmd];
  return next.length > cap ? next.slice(next.length - cap) : next;
}