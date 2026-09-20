export interface Suggestion {
  label: string;
  hint: string;
}

export const FIXED_COMMANDS: ReadonlyArray<readonly [string, string]> = [
  ["ls", "list the current directory"],
  ["cd ~/posts", "the notes"],
  ["cd ~/topics", "one dir per tag"],
  ["cd ~/about", "me.md, stack.json, projects"],
  ["resume", "work history and skills"],
  ["tree ~", "two levels"],
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