import { getAvailablePaths, isDirectory } from "../lib/path.ts";
import { Command, type Section } from "./Command.ts";

const DEFAULT_ARG = "/";

const ROUTE_FOR_SECTION: Record<Section, string> = {
  posts: "/",
  topics: "/topics/",
  about: "/about/",
};

export function sectionForTopSegment(segment: string): Section {
  if (segment === "topics") return "topics";
  if (segment === "about") return "about";
  return "posts";
}

export class CdCommand extends Command {
  readonly name = "cd";
  readonly syntax = "cd [directory_path]";
  readonly description = "Change the current directory.";
  protected readonly argRule = "optional" as const;

private constructor({ arg, cwd, availablePaths }: { arg?: string | null; cwd?: string; availablePaths: Record<string, string> }) {
    super({ arg, cwd, availablePaths });
  }

  static init(arg: string | null | undefined, cwd: string, availablePaths: Record<string, string> = {}): CdCommand {
    return new CdCommand({ arg, cwd, availablePaths });
  }

  async execute(): Promise<CommandResult> {
    const { cwd = "", section = "posts" } = this.context ?? {};
    const targetArg = this.initialArg ?? DEFAULT_ARG;
    const target = this.resolvePath(targetArg, cwd);
    if (!isDirectory(target, getAvailablePaths())) {
      return { kind: "error", message: `cd: no such directory: ${targetArg}` };
    }

    const topSegment = target.split("/").filter(Boolean)[0] ?? "";
    const targetSection = sectionForTopSegment(topSegment);
    if (targetSection !== section) {
      return { kind: "navigate", path: ROUTE_FOR_SECTION[targetSection] };
    }
    return { kind: "cwd", cwd: target };
  }
}