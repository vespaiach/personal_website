import { getAvailablePaths, isDirectory } from "../lib/path.ts";
import { Command, type CommandContext, type CommandResult, type Section } from "./Command.ts";

const DEFAULT_ARG = "/";

const ROUTE_FOR_SECTION: Record<Section, string> = {
  posts: "/",
  topics: "/topics/",
  about: "/about/",
};

function sectionForTopSegment(segment: string): Section {
  if (segment === "topics") return "topics";
  if (segment === "about") return "about";
  return "posts";
}

export class CdCommand extends Command {
  readonly name = "cd";
  readonly syntax = "cd [directory_path]";
  readonly description = "Change the current directory.";
  protected readonly argRule = "optional" as const;

  async execute(arg: string | undefined, { cwd, section }: CommandContext): Promise<CommandResult> {
    const target = this.resolvePath(arg ?? DEFAULT_ARG, cwd);
    if (!isDirectory(target, getAvailablePaths())) {
      return { kind: "error", message: `cd: no such directory: ${arg ?? DEFAULT_ARG}` };
    }

    const topSegment = target.split("/").filter(Boolean)[0] ?? "";
    const targetSection = sectionForTopSegment(topSegment);
    if (targetSection !== section) {
      return { kind: "navigate", path: ROUTE_FOR_SECTION[targetSection] };
    }
    return { kind: "cwd", cwd: target };
  }
}