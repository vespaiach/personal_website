export function parseCommand(inputPrompt: string): string[] {
  return inputPrompt
    .toLowerCase()
    .split("&&")
    .map((command) => command.trim().replace(/\s+/g, " "))
    .filter((command) => command.length > 0);
}