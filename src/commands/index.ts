import { CatCommand } from "./CatCommand.ts";
import { CdCommand } from "./CdCommand.ts";
import { ClearCommand } from "./ClearCommand.ts";
import { HelpCommand } from "./HelpCommand.ts";
import { LsCommand } from "./LsCommand.ts";
import { ResumeCommand } from "./ResumeCommand.ts";
import { TreeCommand } from "./TreeCommand.ts";

export const commandClasses = {
  cat: CatCommand,
  cd: CdCommand,
  clear: ClearCommand,
  help: HelpCommand,
  ls: LsCommand,
  resume: ResumeCommand,
  tree: TreeCommand,
};

export async function execute(rawCommand: string, cwd: string): Promise<CommandResult> {
  const name = rawCommand.trim().split(" ")[0] ?? "";
  const CommandClass = commandClasses[name as keyof typeof commandClasses];

  if (!CommandClass) {
    return { kind: "error", message: "Unknown command", cwd };
  }

  return CommandClass.init(rawCommand, cwd).execute();
}