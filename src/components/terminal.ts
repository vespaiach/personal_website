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