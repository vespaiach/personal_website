import { Command, type CommandContext, type CommandResult } from "./Command.ts";

export class ClearCommand extends Command {
  readonly name = "clear";
  readonly syntax = "clear";
  readonly description = "Clear the terminal output log.";
  protected readonly argRule = "none" as const;

  private constructor(initialArg?: string, context?: CommandContext) {
    super(initialArg, context);
  }

  static init(arg?: string, context?: CommandContext): ClearCommand {
    return new ClearCommand(arg, context);
  }

  async execute(): Promise<CommandResult> {
    return { kind: "clear" };
  }
}