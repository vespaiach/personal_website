import Alpine from "alpinejs";

// Global ⌘K listener. The active nav link is resolved statically by
// partials/header.html itself (via the `active` arg vite-plugin-html-inject
// substitutes in), so this component no longer needs to track it.
export function registerHeader() {
  Alpine.data("header", () => ({
    init() {
      window.addEventListener("keydown", (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          Alpine.store("palette")?.show();
        }
      });
    },
  }));
}
