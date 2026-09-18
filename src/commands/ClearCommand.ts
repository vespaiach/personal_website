import { Command } from "./Command.ts";

export class ClearCommand extends Command {
  readonly name = "clear";
  static syntax = "clear";
  static description = "Clear the terminal output log.";
  protected readonly argRule = "none" as const;

  private constructor({ rawCommand, cwd }: { rawCommand: string; cwd: string }) {
    super({ rawCommand, cwd });
  }

  static init(command: string, cwd: string): ClearCommand {
    return new ClearCommand({ rawCommand: command, cwd });
  }

  async execute(): Promise<CommandResult> {
    return Promise.resolve({ kind: "clear", cwd: this.cwd });
  }
}