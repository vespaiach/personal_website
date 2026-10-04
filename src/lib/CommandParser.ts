export function parseCommand(inputPrompt: string): string[] {
  return inputPrompt
    .split("&&")
    .map((command) =>
      command
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^\S+/, (name) => name.toLowerCase()),
    )
    .filter((command) => command.length > 0);
}