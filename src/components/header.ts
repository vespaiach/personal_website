import Alpine from "alpinejs";
import { openCommandPalette } from "../lib/commandPalette";

export function registerHeader() {
  Alpine.data("header", () => ({
    init() {
      window.addEventListener("keydown", (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          openCommandPalette();
        }
      });
    },
  }));
}