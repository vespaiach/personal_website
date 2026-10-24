import { Command } from "./Command.ts";

export class CatCommand extends Command {
  readonly name = "cat";
  static syntax = "cat <file_path>";
  static description = "Print a file's contents.";
  protected readonly argRule = "required" as const;

  private constructor({ command, cwd }: { command: string; cwd: string }) {
    super({ rawCommand: command, cwd });
  }

  static init(command: string, cwd: string): CatCommand {
    return new CatCommand({ command, cwd });
  }

  execute(): Promise<CommandResult> {
    return this.fetchView();
  }
}