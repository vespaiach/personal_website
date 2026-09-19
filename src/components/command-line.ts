import Alpine from "alpinejs";
import { execute } from "../commands/index.ts";
import { parseCommand } from "../lib/CommandParser.ts";

export interface Prompt {
  prompt: string;
  cwd: string;
}

interface ScopeMagics {
  $nextTick(): Promise<void>;
  $dispatch(event: string): void;
}

export function registerCommandLine() {
  Alpine.data("commandLine", (line: Prompt) => ({
    user: "trinh",
    host: "vespaiach",
    prompt: line.prompt,
    cwd: line.cwd ?? "/",
    results: [] as CommandResult[],

    async init() {
      await this.execute();
      const magics = this as unknown as ScopeMagics;
      await magics.$nextTick();
      magics.$dispatch("command-finished");
    },

    async clearTerminal(remainingCommands: string[]) {
      const prompts = Alpine.store("prompts");
      prompts.clear();
      if (remainingCommands.length === 0) return;
      await Alpine.nextTick();
      prompts.add(remainingCommands.join(" && "), this.cwd);
    },

    async execute() {
      const commands = parseCommand(this.prompt);
      if (commands.length === 0) {
        this.results.push({ kind: "error", message: "No commands entered", cwd: this.cwd });
        return;
      }

      for (const [index, command] of commands.entries()) {
        try {
          const result = await execute(command, this.cwd);
          if (result.kind === "error") {
            this.results.push(result);
            this.cwd = result.cwd;
          } else if (result.kind === "clear") {
            await this.clearTerminal(commands.slice(index + 1));
            return;
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