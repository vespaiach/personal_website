import Alpine from "alpinejs";
import { toggleCommandPalette } from "../lib/commandPalette";

export interface Prompt {
  cwd: string;
  command: string;
}

export function registerShell() {
  Alpine.data("shell", (cwd: string, initialPrompt?: string) => ({
    user: "trinh",
    host: "vespaiach",
    cwd,
    prompts: initialPrompt ? [{ command: initialPrompt, cwd }] : ([] as Prompt[]),

    togglePalette() {
      toggleCommandPalette();
    },
  }));
}