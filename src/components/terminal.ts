import Alpine from "alpinejs";

export function registerTerminal() {
  Alpine.data("terminal", () => ({
    command: "",

    run() {
      const command = this.command.trim();
      if (!command) return;
      Alpine.store("prompts").add(command, Alpine.store("cwd").value);
      this.command = "";
    },

    scrollToBottom() {
      window.scrollTo(0, document.documentElement.scrollHeight);
    },
  }));
}