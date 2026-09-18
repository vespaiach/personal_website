import { Command } from "./Command.ts";

export class CatCommand extends Command {
  readonly name = "cat";
  readonly syntax = "cat <file_path>";
  readonly description = "Print a file's contents.";
  protected readonly argRule = "required" as const;

  private constructor({ arg, cwd, availablePaths }: { arg?: string; cwd?: string; availablePaths: Record<string, string> }) {
    super({ arg, cwd, availablePaths });
  }

  static init(command: string, cwd: string, availablePaths: Record<string, string> = {}): CatCommand {
    return new CatCommand({ arg, cwd, availablePaths });
  }

  async execute(): Promise<CommandResult> {
    const target = this.resolvePath(this.initialArg ?? "", this.cwd);
    const filename = target.split("/").pop() ?? "";
    const slug = filename.replace(/\.[^./]+$/, "");

    try {
      // src/generated/ is only servable under `vite dev` — a production build
      // never copies it into dist/, since pages consume it via build-time <load>.
      const response = await fetch(`/src/generated/${slug}-view.html`);
      if (!response.ok) {
        return { kind: "error", message: `cat: ${target}: No such file or directory` };
      }
      return { kind: "html", html: await response.text() };
    } catch {
      return { kind: "error", message: `cat: failed to load '${target}'` };
    }
  }
}