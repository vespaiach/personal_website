import { Command } from "./Command.ts";

export class TreeCommand extends Command {
  readonly name = "tree";
  static syntax = "tree [directory_path]";
  static description = "Show a directory and everything under it as a tree.";
  protected readonly argRule = "optional" as const;

  private constructor({ command, cwd }: { command: string; cwd: string }) {
    super({ rawCommand: command, cwd });
  }

  static init(command: string, cwd: string): TreeCommand {
    return new TreeCommand({ command, cwd });
  }

  execute(): Promise<CommandResult> {
    return this.fetchView();
  }
}