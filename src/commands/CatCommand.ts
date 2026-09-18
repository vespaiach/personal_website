import { Command, type CommandContext, type CommandResult } from "./Command.ts";

export class CatCommand extends Command {
  readonly name = "cat";
  readonly syntax = "cat <file_path>";
  readonly description = "Print a file's contents.";
  protected readonly argRule = "required" as const;

  private constructor(initialArg?: string, context?: CommandContext) {
    super(initialArg, context);
  }

  static init(arg?: string, context?: CommandContext): CatCommand {
    return new CatCommand(arg, context);
  }

  async execute(): Promise<CommandResult> {
    const target = this.resolvePath(this.initialArg ?? "", this.context?.cwd ?? "");
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