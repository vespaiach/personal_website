import Alpine from "alpinejs";

const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, summary, label, dialog, [contenteditable]";

interface TerminalRefs {
  $refs: { commandInput: HTMLInputElement };
}

export function registerTerminal() {
  Alpine.data("terminal", () => ({
    command: "",

    run() {
      const command = this.command.trim();
      if (!command) return;
      Alpine.store("prompts").add(command, Alpine.store("cwd").value);
      this.command = "";
    },

    focusPrompt(event: MouseEvent) {
      const target = event.target as Element;
      if (target.closest(INTERACTIVE_SELECTOR)) return;
      if (!window.getSelection()?.isCollapsed) return;
      (this as unknown as TerminalRefs).$refs.commandInput.focus();
    },

    scrollAfterCommand(event: Event) {
      const articleHeader = (event.target as HTMLElement).querySelector("article > header");
      if (articleHeader) {
        articleHeader.scrollIntoView();
        return;
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    },
  }));
}