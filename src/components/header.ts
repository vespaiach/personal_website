import Alpine from "alpinejs";

export function registerHeader() {
  Alpine.data("header", () => ({
    init() {
      window.addEventListener("keydown", (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          document.querySelector("dialog")?.showModal();
        }
      });
    },
  }));
}