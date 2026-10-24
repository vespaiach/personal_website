import { Command } from "./Command.ts";

export class CdCommand extends Command {
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

  protected get defaultPath(): string {
    return "/";
  }

  static init(command: string, cwd: string): CdCommand {
    return new CdCommand({ rawCommand: command, cwd });
  }

  async execute(): Promise<CommandResult> {
    const result = this.resolvePath();
    if (!result.valid) return { kind: "error", message: `cd: ${result.error}`, cwd: this.cwd };

    this.cwd = result.absolutePath;
    return { kind: "cwd", cwd: this.cwd };
  }
}