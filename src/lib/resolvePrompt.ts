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
  const resolutionCwd = cwd || "/";
  for (const cmd of parsed.result) {
    if (!PATH_COMMANDS.has(cmd.command)) {
      commands.push(cmd);
      continue;
    }

    let resolvedPath: string | undefined;
    const arg = cmd.arg?.replace(/^~(?=\/|$)/, "") ?? "";
    if (arg) {
      resolvedPath = toAbsolutePath(arg, resolutionCwd);
      if (!(resolvedPath in manifest)) {
        return { valid: false, error: `No such file or directory: ${resolvedPath}`, commands: [] };
      }
    }

    commands.push({ ...cmd, resolvedPath });
  }

  return { valid: true, error: null, commands };
}