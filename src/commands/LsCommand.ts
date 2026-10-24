import { Command } from "./Command.ts";

export class LsCommand extends Command {
  readonly name = "ls";
  static syntax = "ls [file_path]";
  static description = "List a virtual directory's contents.";
  protected readonly argRule = "optional" as const;

  private constructor({ command, cwd }: { command: string; cwd: string }) {
    super({ rawCommand: command, cwd });
  }

  static init(command: string, cwd: string): LsCommand {
    return new LsCommand({ command, cwd });
  }

  execute(): Promise<CommandResult> {
    return this.fetchView();
  }
}