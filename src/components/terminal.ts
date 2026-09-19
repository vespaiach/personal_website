import Alpine from "alpinejs";

export function registerTerminal() {
  Alpine.data("terminal", () => ({
    openPalette() {
      document.querySelector("dialog")?.showModal();
    },
  }));
}