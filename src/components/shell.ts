import Alpine from "alpinejs";
import { toggleCommandPalette } from "../lib/commandPalette";

export interface Prompt {
  cwd: string;
  command: string;
}

export function registerShell() {
  Alpine.data("shell", (cwd: string, initialPrompt?: Prompt) => ({
    user: "trinh",
    host: "vespaiach",
    cwd,
    prompts: initialPrompt ? [initialPrompt] : ([] as Prompt[]),

    togglePalette() {
      toggleCommandPalette();
    },
  }));
}