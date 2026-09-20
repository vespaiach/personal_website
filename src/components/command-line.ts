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

const TYPE_INTERVAL_MS = 16;
const TYPE_MAX_TICKS = 34;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function registerCommandLine() {
  Alpine.data("commandLine", (line: Prompt, index: number) => ({
    prompt: line.prompt,
    cwd: line.cwd ?? "/",
    results: [] as CommandResult[],
    typed: "",
    typing: true,

    async init() {
      await this.type();
      await this.execute();
      const magics = this as unknown as ScopeMagics;
      await magics.$nextTick();
      magics.$dispatch("command-finished");
    },

    type(): Promise<void> {
      const reducedMotion = matchMedia(REDUCED_MOTION).matches;
      const step = reducedMotion
        ? this.prompt.length
        : Math.max(1, Math.ceil(this.prompt.length / TYPE_MAX_TICKS));
      const superseded = () => Alpine.store("prompts").values.length > index + 1;
      return new Promise((resolve) => {
        const timer = setInterval(() => {
          this.typed = this.prompt.slice(0, superseded() ? this.prompt.length : this.typed.length + step);
          if (this.typed.length < this.prompt.length) return;
          clearInterval(timer);
          this.typing = false;
          resolve();
        }, TYPE_INTERVAL_MS);
      });
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