import Alpine from "alpinejs";
import { execute } from "../commands/index.ts";
import { parseCommand } from "../lib/CommandParser.ts";

export interface Prompt {
  prompt: string;
  cwd: string;
}

export function registerCommandLine() {
  Alpine.data("commandLine", (line: Prompt) => {
    type CommandLineComponent = {
      user: string;
      host: string;
      prompt: string;
      cwd: string;
      results: CommandResult[];
      init(): Promise<void>;
      attachFileClickHandlers(): void;
    };

    const self: CommandLineComponent = {
      user: "trinh",
      host: "vespaiach",
      prompt: line.prompt,
      cwd: line.cwd ?? "/",
      results: [] as CommandResult[],

      async init(this: typeof self) {
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

        setTimeout(() => this.attachFileClickHandlers(), 0);
      },

      attachFileClickHandlers(this: typeof self) {
        const sections = document.querySelectorAll("section");
        sections.forEach((section) => {
          section.addEventListener("click", async (e: Event) => {
            const button = (e.target as HTMLElement).closest(".ls-file-link");
            if (!button) return;

            const filePath = (button as HTMLButtonElement).dataset.filePath;
            if (!filePath) return;

            try {
              const result = await execute(`cat ${filePath}`, this.cwd);
              this.results.push(result);
              this.cwd = result.cwd;
              Alpine.store("cwd").update(this.cwd);
            } catch (error) {
              console.error(error);
              this.results.push({ kind: "error", message: `Failed: cat ${filePath}`, cwd: this.cwd });
            }
          });
        });
      },
    };
    return self;
  });
}