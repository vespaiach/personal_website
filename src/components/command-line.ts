import Alpine from "alpinejs";
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

    init() {
      const { valid, error, commands } = resolvePrompt(this.prompt, this.cwd, Alpine.store("manifest").paths);
      this.valid = valid;
      this.error = error;
      this.commands = commands;
    },
  }));
}