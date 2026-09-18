import { Command, type CommandContext, type CommandResult } from "./Command.ts";

const SLUG_FOR_PATH: Record<string, string> = {
  "/posts": "posts-listing",
  "/topics": "topics-listing",
  "/about": "about-listing",
  "/about/projects": "projects-listing",
};

export class LsCommand extends Command {
  readonly name = "ls";
  readonly syntax = "ls [file_path]";
  readonly description = "List a virtual directory's contents.";
  protected readonly argRule = "optional" as const;

  private constructor(initialArg?: string, context?: CommandContext) {
    super(initialArg, context);
  }

  static init(arg?: string, context?: CommandContext): LsCommand {
    return new LsCommand(arg, context);
  }

  async execute(): Promise<CommandResult> {
    const cwd = this.context?.cwd ?? "";
    const target = this.initialArg ? this.resolvePath(this.initialArg, cwd) : cwd;
    const slug = SLUG_FOR_PATH[target];
    if (!slug) {
      return { kind: "error", message: `ls: cannot access '${target}': No such directory` };
    }

    try {
      // src/generated/ is only servable under `vite dev` — a production build
      // never copies it into dist/, since pages consume it via build-time <load>.
      const response = await fetch(`/src/generated/${slug}.html`);
      if (!response.ok) {
        return { kind: "error", message: `ls: cannot access '${target}': No such directory` };
      }
      return { kind: "html", html: await response.text() };
    } catch {
      return { kind: "error", message: `ls: failed to load '${target}'` };
    }
  }
}