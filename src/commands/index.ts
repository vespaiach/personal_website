import { CatCommand } from "./CatCommand.ts";
import { CdCommand } from "./CdCommand.ts";
import { ClearCommand } from "./ClearCommand.ts";
import type { Command, CommandContext } from "./Command.ts";
import { HelpCommand } from "./HelpCommand.ts";
import { LsCommand } from "./LsCommand.ts";
import { TreeCommand } from "./TreeCommand.ts";

export const ls = LsCommand.init();
export const cat = CatCommand.init();
export const cd = CdCommand.init();
export const clear = ClearCommand.init();
export const tree = TreeCommand.init();
export const help = HelpCommand.init(undefined, undefined, [ls, cat, cd, clear, tree]);

export const commands: Record<string, Command> = { ls, cat, cd, clear, tree, help };

export function initCommand(
  name: string,
  arg: string | undefined,
  context: CommandContext,
): Command | undefined {
  if (name === "ls") return LsCommand.init(arg, context);
  if (name === "cat") return CatCommand.init(arg, context);
  if (name === "cd") return CdCommand.init(arg, context);
  if (name === "clear") return ClearCommand.init(arg, context);
  if (name === "tree") return TreeCommand.init(arg, context);
  if (name === "help") return HelpCommand.init(arg, context, [ls, cat, cd, clear, tree]);
  return undefined;
}