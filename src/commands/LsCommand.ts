import { Command, type HasPathArgument } from "./Command.ts";

export class LsCommand extends Command implements HasPathArgument {
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

  async execute(): Promise<CommandResult> {
    const result = this.resolvePath();
    if (!result.valid) return { kind: "error", message: `ls: ${result.error}`, cwd: this.cwd };

    try {
      const response = await fetch(result.resourcePath);
      if (!response.ok) {
        return { kind: "error", message: "ls: failed to execute command", cwd: this.cwd };
      }
      return { kind: "html", html: await response.text(), cwd: this.cwd };
    } catch {
      return { kind: "error", message: "ls: failed to execute command", cwd: this.cwd };
    }
  }
}