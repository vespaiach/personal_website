import Alpine from "alpinejs";

export function registerHeader() {
  Alpine.data("header", () => ({
    init() {
      window.addEventListener("keydown", (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          Alpine.$data(document.body).paletteOpen = true;
        }
      });
    },
  }));
}