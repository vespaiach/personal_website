import Alpine from "alpinejs";

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

    toggleCommandPalette() {
      const dialog = document.getElementById("command-palette") as HTMLDialogElement;
      if (!dialog) return;
      if (dialog.open) {
        dialog.close();
      } else {
        dialog.showModal();
      }
    },
  }));
}