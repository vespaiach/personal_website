import Alpine from "alpinejs";

function dialogById(id: string) {
  return document.getElementById(id) as HTMLDialogElement | null;
}

export function registerHeader() {
  Alpine.data("header", () => ({
    init() {
      window.addEventListener("keydown", (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          dialogById("command-palette")?.showModal();
        }
      });
    },

    toggleCommandPalette() {
      const dialog = dialogById("command-palette");
      if (dialog) {
        if (dialog.open) {
          dialog.close();
        } else {
          dialog.showModal();
        }
      }
    },

    showHelp() {
      dialogById("help-modal")?.showModal();
    },
  }));
}