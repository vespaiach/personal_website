import { Command, type CommandContext, type CommandDescriptor, type CommandResult } from "./Command.ts";

export class HelpCommand extends Command {
  readonly name = "help";
  readonly syntax = "help";
  readonly description = "List every available command.";
  protected readonly argRule = "none" as const;

  private readonly commands: CommandDescriptor[];

  private constructor(
    initialArg: string | undefined,
    context: CommandContext | undefined,
    commands: CommandDescriptor[],
  ) {
    super(initialArg, context);
    this.commands = commands;
  }

  static init(arg?: string, context?: CommandContext, commands: CommandDescriptor[] = []): HelpCommand {
    return new HelpCommand(arg, context, commands);
  }

  async execute(): Promise<CommandResult> {
    const all = [...this.commands, this as CommandDescriptor];
    const text = all.map((command) => `${command.syntax.padEnd(24)}${command.description}`).join("\n");
    return { kind: "text", text };
  }
}