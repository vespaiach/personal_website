import Alpine from "alpinejs";
import { buildSuggestions, type Suggestion } from "../lib/commandSuggestions";

interface Prompt {
  command: string;
}

interface ShellState {
  cwd: string;
  prompts: Prompt[];
}

interface DialogRefs {
  $refs: { dialog: HTMLDialogElement };
}

export function registerCommandPalette() {
  Alpine.data("commandPalette", () => ({
    query: "",
    suggestions: [] as Suggestion[],
    selectedIndex: 0,

    init() {
      this.reset();
    },

    reset() {
      this.query = "";
      this.selectedIndex = 0;
      this.suggestions = buildSuggestions("", this.recentCommands());
    },

    recentCommands(): string[] {
      const prompts = Alpine.store("prompts").values;
      return prompts.map((it) => it.prompt);
    },

    onInput() {
      this.suggestions = buildSuggestions(this.query, this.recentCommands());
      this.selectedIndex = 0;
    },

    moveSelection(delta: number) {
      if (this.suggestions.length === 0) return;
      const max = this.suggestions.length - 1;
      this.selectedIndex = Math.min(max, Math.max(0, this.selectedIndex + delta));
    },

    onArrowUp() {
      this.moveSelection(-1);
    },

    completeSelected() {
      const selected = this.suggestions[this.selectedIndex];
      if (!selected) return;
      this.query = selected.label;
      this.onInput();
    },

    run(command: string) {
      const { cwd } = this as unknown as ShellState;
      Alpine.store("prompts").add(command, cwd);
      this.close();
    },

    runSuggestion(suggestion: Suggestion) {
      this.run(suggestion.label);
    },

    runSelected() {
      const command = this.suggestions[this.selectedIndex]?.label ?? this.query.trim();
      if (!command) return;
      this.run(command);
    },

    get matchLabel(): string {
      const count = this.suggestions.length;
      if (count === 0) return "";
      return `${count} match${count === 1 ? "" : "es"}`;
    },

    close() {
      (this as unknown as DialogRefs).$refs.dialog.close();
      this.reset();
    },

    lightDismiss(event: MouseEvent) {
      const rect = (this as unknown as DialogRefs).$refs.dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        this.close();
      }
    },
  }));
}