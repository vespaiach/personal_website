import Alpine from "alpinejs";
import { closeCommandPalette } from "../lib/commandPalette";
import { buildSuggestions, pushRecent, type Suggestion } from "../lib/commandSuggestions";

export function registerCommandPalette() {
  Alpine.store("palette", {
    query: "",
    suggestions: [] as Suggestion[],
    selectedIndex: 0,
    recent: [] as string[],

    init() {
      this.reset();
    },

    reset() {
      this.query = "";
      this.selectedIndex = 0;
      this.suggestions = buildSuggestions("", this.recent);
    },

    onInput() {
      this.suggestions = buildSuggestions(this.query, this.recent);
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

    runSuggestion(suggestion: Suggestion) {
      this.recent = pushRecent(this.recent, suggestion.label);
      closeCommandPalette();
    },

    runSelected() {
      const command = this.suggestions[this.selectedIndex]?.label ?? this.query.trim();
      if (!command) return;
      this.recent = pushRecent(this.recent, command);
      closeCommandPalette();
    },

    get matchLabel(): string {
      const count = this.suggestions.length;
      if (count === 0) return "";
      return `${count} match${count === 1 ? "" : "es"}`;
    },
  });
}