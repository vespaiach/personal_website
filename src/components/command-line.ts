import Alpine from "alpinejs";
import { execute } from "../commands/index.ts";
import { parseCommand } from "../lib/CommandParser.ts";

export interface Prompt {
  prompt: string;
  cwd: string;
}

export function registerCommandLine() {
  Alpine.data("commandLine", (line: Prompt) => ({
    user: "trinh",
    host: "vespaiach",
    prompt: line.prompt,
    cwd: line.cwd ?? "/",
    results: [] as CommandResult[],

    async init() {
      const commands = parseCommand(this.prompt);
      if (commands.length === 0) {
        this.results.push({ kind: "error", message: "No commands entered", cwd: this.cwd });
        return;
      }

      for (const command of commands) {
        try {
          const result = await execute(command, this.cwd);
          if (result.kind === "error") {
            this.results.push(result);
            this.cwd = result.cwd;
          } else if (result.kind === "clear") {
            this.results = [];
          } else {
            this.results.push(result);
          }
          this.cwd = result.cwd;
          Alpine.store("cwd").update(this.cwd);
        } catch (error) {
          console.error(error);
          this.results.push({ kind: "error", message: `Failed: ${command}`, cwd: this.cwd });
        }
      }
    },
  }));
}