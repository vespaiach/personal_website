import { Command } from "./Command.ts";

export class ContactCommand extends Command {
  readonly name = "contact";
  static syntax = "contact";
  static description = "Show a form to send me a message.";
  protected readonly argRule = "none" as const;

  private constructor({ rawCommand, cwd }: { rawCommand: string; cwd: string }) {
    super({ rawCommand, cwd });
  }

  static init(command: string, cwd: string): ContactCommand {
    return new ContactCommand({ rawCommand: command, cwd });
  }

  async execute(): Promise<CommandResult> {
    return Promise.resolve({ kind: "contact", cwd: this.cwd });
  }
}