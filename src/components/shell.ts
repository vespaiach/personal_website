import Alpine from "alpinejs";
import { toggleCommandPalette } from "../lib/commandPalette";

export function registerShell() {
  Alpine.data("shell", (cwd: string, initialPrompt?: string) => ({
    user: "trinh",
    host: "vespaiach",
    cwd,
    prompts: initialPrompt ? [initialPrompt] : [],

    togglePalette() {
      toggleCommandPalette();
    },
  }));
}