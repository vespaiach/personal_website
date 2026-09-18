import Alpine from "alpinejs";
import { sectionForTopSegment } from "../commands/CdCommand.ts";
import type { CommandContext, CommandResult } from "../commands/Command.ts";
import { initCommand } from "../commands/index.ts";
import { resolvePrompt } from "../lib/resolvePrompt";

export interface Prompt {
  prompt: string;
  cwd: string;
}

export function registerCommandLine() {
  Alpine.data("commandLine", (line: Prompt) => ({
    user: "trinh",
    host: "vespaiach",
    prompt: line.prompt,
    cwd: line.cwd ?? "",
    valid: true,
    error: null as string | null,
    commands: [] as ReturnType<typeof resolvePrompt>["commands"],
    results: [] as CommandResult[],

    async init() {
      const { valid, error, commands } = resolvePrompt(this.prompt, this.cwd, Alpine.store("manifest").paths);
      this.valid = valid;
      this.error = error;
      this.commands = commands;

      if (!valid) return;

      const topSegment = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
      const context: CommandContext = { cwd: this.cwd, section: sectionForTopSegment(topSegment) };

      for (const resolved of this.commands) {
        const command = initCommand(resolved.command, resolved.arg, context);
        if (!command) continue;
        const result = await command.execute();

        if (result.kind === "html" || result.kind === "text" || result.kind === "error") {
          this.results.push(result);
        }

        if (result.kind === "cwd") {
          Alpine.store("cwd").update(result.cwd);
        } else if (result.kind === "clear") {
          Alpine.store("prompts").clear();
          break;
        } else if (result.kind === "navigate") {
          window.location.assign(result.path);
          break;
        }
      }
    },
  }));
}