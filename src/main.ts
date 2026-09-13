import "./styles/global.css";

import Alpine from "alpinejs";

import { registerShell } from "./components/shell";
import { registerTerminal } from "./components/terminal";

registerShell();
registerTerminal();

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}
window.Alpine = Alpine;
Alpine.start();