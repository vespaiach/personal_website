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

export function resolvePrompt(prompt: string, cwd: string, manifest: Record<string, string>): ResolveResult {
  const parsed = parseCommand(prompt);
  if (!parsed.success) {
    return { valid: false, error: parsed.error, commands: [] };
  }

  const commands: ResolvedCommand[] = [];
  for (const cmd of parsed.result) {
    if (!PATH_COMMANDS.has(cmd.command)) {
      commands.push(cmd);
      continue;
    }

    const resolvedPath = toAbsolutePath(cmd.arg ?? "", cwd);
    if (!(resolvedPath in manifest)) {
      return { valid: false, error: `No such file or directory: ${resolvedPath}`, commands: [] };
    }

    commands.push({ ...cmd, resolvedPath });
  }

  return { valid: true, error: null, commands };
}