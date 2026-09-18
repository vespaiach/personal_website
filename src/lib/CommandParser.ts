import { commands } from "../commands/index.ts";

export interface ParseResult {
  success: boolean;
  result: CommandObject[];
  error: string | null;
}

/**
 * Parses a raw terminal input line into an ordered list of commands.
 * Commands are separated by `&`; each command is split into its name
 * and the remainder of the segment as a single arg string (or omitted
 * when there is no arg).
 *
 * Fails (success: false, result: []) when any segment is empty — e.g.
 * blank input, or leading/trailing/repeated `&` separators — when a
 * segment's command name isn't one of the supported commands — or when
 * a command's arg doesn't match its own syntax (each command's own
 * validate() decides this — see src/commands/).
 */
export function parseCommand(input: string): ParseResult {
  const segments = input.split("&").map((segment) => segment.trim());

  if (segments.some((segment) => segment === "")) {
    return { success: false, result: [], error: "Wrong command syntax" };
  }

  const result: CommandObject[] = [];
  for (const segment of segments) {
    const spaceIndex = segment.indexOf(" ");
    const commandName = spaceIndex === -1 ? segment : segment.slice(0, spaceIndex);
    const arg = spaceIndex === -1 ? undefined : segment.slice(spaceIndex + 1).trim() || undefined;

    const command = commands[commandName];
    if (!command) {
      return { success: false, result: [], error: `Unknown command: ${commandName}` };
    }

    if (!command.validate(arg).valid) {
      return { success: false, result: [], error: "Wrong command syntax" };
    }

    result.push(arg ? { command: commandName, arg } : { command: commandName });
  }

  return { success: true, result, error: null };
}