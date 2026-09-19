import "./styles/global.css";

import Alpine from "alpinejs";

import { registerCommandLine } from "./components/command-line";
import { registerCommandPalette } from "./components/command-palette";
import { registerHeader } from "./components/header";
import { registerHelpModal } from "./components/help-modal";
import { registerTerminal } from "./components/terminal";
import manifest from "./manifest.json";

registerCommandLine();
registerCommandPalette();
registerHeader();
registerHelpModal();
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

Alpine.store("activeLink", {
  value: "",
  update(value: string) {
    this.value = value;
  },
});

Alpine.store("manifest", {
  values: manifest,
  get(path: string) {
    return this.values[path] ? { existing: true, value: this.values[path] } : { existing: false };
  },
});

window.Alpine = Alpine;
Alpine.start();