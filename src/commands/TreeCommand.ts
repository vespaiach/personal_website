import { Command, type HasPathArgument } from "./Command.ts";

export class TreeCommand extends Command implements HasPathArgument {
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

  async execute(): Promise<CommandResult> {
    const result = this.resolvePath();
    if (!result.valid) return { kind: "error", message: `tree: ${result.error}`, cwd: this.cwd };

    try {
      const response = await fetch(result.resourcePath);
      if (!response.ok) {
        return { kind: "error", message: "tree: failed to execute command", cwd: this.cwd };
      }
      return { kind: "html", html: await response.text(), cwd: this.cwd };
    } catch {
      return { kind: "error", message: "tree: failed to execute command", cwd: this.cwd };
    }
  }
}