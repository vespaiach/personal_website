import { CatCommand } from "./CatCommand.ts";
import { CdCommand } from "./CdCommand.ts";
import { Command } from "./Command.ts";

export class ResumeCommand extends Command {
  readonly name = "resume";
  static syntax = "resume";
  static description = "Print my resume from anywhere: cd ~/about && cat resume.md.";
  protected readonly argRule = "none" as const;

  private constructor({ rawCommand, cwd }: { rawCommand: string; cwd: string }) {
    super({ rawCommand, cwd });
  }

  static init(command: string, cwd: string): ResumeCommand {
    return new ResumeCommand({ rawCommand: command, cwd });
  }

  async execute(): Promise<CommandResult> {
    const cdResult = await CdCommand.init("cd /about", this.cwd).execute();
    if (cdResult.kind === "error") return cdResult;

    return CatCommand.init("cat resume.md", cdResult.cwd).execute();
  }
}