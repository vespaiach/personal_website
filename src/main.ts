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

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}
window.Alpine = Alpine;
Alpine.start();