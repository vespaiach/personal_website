import "./styles/global.css";

import Alpine from "alpinejs";

import { registerCommandPalette } from "./components/command-palette";
import { registerHeader } from "./components/header";
import { registerShell } from "./components/shell";
import { registerTerminal } from "./components/terminal";

registerCommandPalette();
registerHeader();
registerShell();
registerTerminal();

Alpine.store("prompts", {
  values: [] as string[],

  add(value: string) {
    this.values.push(value);
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