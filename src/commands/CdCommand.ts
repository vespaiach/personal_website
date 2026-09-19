import { Command, type HasPathArgument } from "./Command.ts";

export class CdCommand extends Command implements HasPathArgument {
  readonly name = "cd";
  static syntax = "cd [directory_path]";
  static description = "Change the current directory.";
  protected readonly argRule = "optional" as const;

  private constructor({ rawCommand, cwd }: { rawCommand: string; cwd: string }) {
    super({ rawCommand, cwd });
  }

  protected get manifestCommand(): string {
    return "ls";
  }

  static init(command: string, cwd: string): CdCommand {
    return new CdCommand({ rawCommand: command, cwd });
  }

  async execute(): Promise<CommandResult> {
    const result = this.resolvePath();
    if (!result.valid) {
      return Promise.resolve({ kind: "error", message: result.error, cwd: this.cwd });
    }

    this.cwd = result.absolutePath;
    return Promise.resolve({ kind: "cwd", cwd: this.cwd });
  }
}