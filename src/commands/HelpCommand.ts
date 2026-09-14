import { Command, type CommandContext, type CommandDescriptor, type CommandResult } from "./Command.ts";

export class HelpCommand extends Command {
  readonly name = "help";
  readonly syntax = "help";
  readonly description = "List every available command.";
  protected readonly argRule = "none" as const;

  private readonly commands: CommandDescriptor[];

  constructor(commands: CommandDescriptor[]) {
    super();
    this.commands = commands;
  }

  async execute(_arg: string | undefined, _context: CommandContext): Promise<CommandResult> {
    const all = [...this.commands, this as CommandDescriptor];
    const text = all.map((command) => `${command.syntax.padEnd(24)}${command.description}`).join("\n");
    return { kind: "text", text };
  }
}