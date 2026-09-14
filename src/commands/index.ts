import { CatCommand } from "./CatCommand.ts";
import { CdCommand } from "./CdCommand.ts";
import { ClearCommand } from "./ClearCommand.ts";
import type { Command } from "./Command.ts";
import { HelpCommand } from "./HelpCommand.ts";
import { LsCommand } from "./LsCommand.ts";
import { TreeCommand } from "./TreeCommand.ts";

export const ls = new LsCommand();
export const cat = new CatCommand();
export const cd = new CdCommand();
export const clear = new ClearCommand();
export const tree = new TreeCommand();
export const help = new HelpCommand([ls, cat, cd, clear, tree]);

export const commands: Record<string, Command> = { ls, cat, cd, clear, tree, help };