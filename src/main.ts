import "./styles/global.css";

import Alpine from "alpinejs";

import { registerCommandPalette } from "./components/command-palette";
import { registerHeader } from "./components/header";
import { registerTerminal } from "./components/terminal";

registerCommandPalette();
registerHeader();
registerTerminal();

Alpine.store("prompts", {
  values: [] as Array<{ prompt: string; cwd: string }>,

  add(prompt: string, cwd: string) {
    this.values.push({ prompt, cwd });
  },

  clear() {
    this.values = [];
  },
});
Alpine.store("cwd", {
  value: "",

  update(value: string) {
    this.value = value;
  },
});

window.Alpine = Alpine;
Alpine.start();