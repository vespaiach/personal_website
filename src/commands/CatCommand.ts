import { Command, type HasPathArgument } from "./Command.ts";

export class CatCommand extends Command implements HasPathArgument {
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

  async execute(): Promise<CommandResult> {
    const result = this.resolvePath();
    if (!result.valid) return { kind: "error", message: `cat: ${result.error}`, cwd: this.cwd };

    try {
      const response = await fetch(result.resourcePath);
      if (!response.ok) {
        return { kind: "error", message: "cat: failed to execute command", cwd: this.cwd };
      }
      return { kind: "html", html: await response.text(), cwd: this.cwd };
    } catch {
      return { kind: "error", message: "cat: failed to execute command", cwd: this.cwd };
    }
  }
}