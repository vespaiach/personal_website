import { type CommandObject, parseCommand } from "./CommandParser";
import { toAbsolutePath } from "./path";

export interface ResolvedCommand extends CommandObject {
  resolvedPath?: string;
}

export interface ResolveResult {
  valid: boolean;
  error: string | null;
  commands: ResolvedCommand[];
}

const PATH_COMMANDS = new Set(["cd", "ls", "cat", "tree"]);

export function resolvePrompt(prompt: string, cwd: string): ResolveResult {
  const parsed = parseCommand(prompt);
  if (!parsed.success) {
    return { valid: false, error: parsed.error, commands: [] };
  }

  const commands = parsed.result.map((cmd) =>
    PATH_COMMANDS.has(cmd.command) ? { ...cmd, resolvedPath: toAbsolutePath(cmd.arg ?? "", cwd) } : cmd,
  );
  return { valid: true, error: null, commands };
}