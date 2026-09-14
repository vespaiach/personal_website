import { Command, type CommandContext, type CommandResult } from "./Command.ts";

export class ClearCommand extends Command {
  readonly name = "clear";
  readonly syntax = "clear";
  readonly description = "Clear the terminal output log.";
  protected readonly argRule = "none" as const;

  async execute(_arg: string | undefined, _context: CommandContext): Promise<CommandResult> {
    return { kind: "clear" };
  }
}