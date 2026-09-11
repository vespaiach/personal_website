import Alpine from "alpinejs";

interface Suggestion {
  label: string;
  hint: string;
  run: string;
}

// Global command palette store (⌘K, or the header button). Dummy state for
// now — TODO: port buildSuggestions/onKey (history, tab-complete, arrow-key
// select) from the original DCLogic class.
export function registerCommandPalette() {
  Alpine.store("palette", {
    open: false,
    query: "",
    suggestions: [] as Suggestion[],
    show() {
      this.open = true;
      this.query = "";
    },
    hide() {
      this.open = false;
    },
  });
}