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

export function resolvePrompt(prompt: string, cwd: string, manifest: Record<string, string>): ResolveResult {
  const parsed = parseCommand(prompt);
  if (!parsed.success) {
    return { valid: false, error: parsed.error, commands: [] };
  }

  const commands: ResolvedCommand[] = [];
  const resolutionCwd = cwd || "/";
  for (const cmd of parsed.result) {
    let resolvedPath: string | undefined;
    const arg = cmd.arg?.replace(/^~(?=\/|$)/, "") ?? "";
    if (arg) {
      const absolutePath = toAbsolutePath(arg, resolutionCwd);
      if (!absolutePath || !manifest[absolutePath]) {
        return { valid: false, error: `No such file or directory: ${arg}`, commands: [] };
      }
      resolvedPath = absolutePath;
      if (!(resolvedPath in manifest)) {
        return { valid: false, error: `No such file or directory: ${resolvedPath}`, commands: [] };
      }
    }

    commands.push({ ...cmd, resolvedPath });
  }

  return { valid: true, error: null, commands };
}