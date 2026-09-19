import { CatCommand } from "./CatCommand.ts";
import { CdCommand } from "./CdCommand.ts";
import { ClearCommand } from "./ClearCommand.ts";
import { Command } from "./Command.ts";
import { LsCommand } from "./LsCommand.ts";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export class HelpCommand extends Command {
  readonly name = "help";
  static syntax = "help";
  static description = "List every available command.";
  protected readonly argRule = "none" as const;

  private constructor({ rawCommand, cwd }: { rawCommand: string; cwd: string }) {
    super({ rawCommand, cwd });
  }

  static init(command: string, cwd: string): HelpCommand {
    return new HelpCommand({ rawCommand: command, cwd });
  }

  async execute(): Promise<CommandResult> {
    const all = [CatCommand, CdCommand, ClearCommand, HelpCommand, LsCommand];
    const rows = all
      .map(
        (command) =>
          `<tr><td class="cmd">${escapeHtml(command.syntax)}</td><td class="desc">${escapeHtml(command.description)}</td></tr>`,
      )
      .join("\n");

    const html = `<div class="terminal-help">
  <div class="help-header">usage: &lt;command&gt; [args]</div>

  <table class="help-table">
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="help-footer">
    <div><span class="meta-label">directories:</span><span class="meta-val meta-val--path">~/posts  ~/topics  ~/about</span></div>
    <div><span class="meta-label">chain with:</span><span class="meta-val">&amp;&amp;</span></div>
  </div>
</div>`;

    return Promise.resolve({ kind: "html", html, cwd: this.cwd });
  }
}