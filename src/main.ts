import "./styles/global.css";

import Alpine from "alpinejs";

import { registerCommandLine } from "./components/command-line";
import { registerCommandPalette } from "./components/command-palette";
import { registerHeader } from "./components/header";
import { registerHelpModal } from "./components/help-modal";
import { registerImageViewer } from "./components/image-viewer";
import { registerTerminal } from "./components/terminal";
import manifest from "./manifest.json";

registerCommandLine();
registerCommandPalette();
registerHeader();
registerHelpModal();
registerImageViewer();
registerTerminal();

Alpine.store("prompts", {
  values: [] as Array<{ prompt: string; cwd: string }>,
  cleared: false,
  add(prompt: string, cwd: string) {
    this.values.push({ prompt, cwd });
  },
  clear() {
    this.values = [];
    this.cleared = true;
  },
});

Alpine.store("cwd", {
  value: document.querySelector("main")?.dataset.cwd ?? "/",
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