import "./styles/global.css";

import Alpine from "alpinejs";

import { registerCommandLine } from "./components/command-line";
import { registerCommandPalette } from "./components/command-palette";
import { registerContactForm } from "./components/contact-form";
import { registerHeader } from "./components/header";
import { registerHelpModal } from "./components/help-modal";
import { registerImageViewer } from "./components/image-viewer";
import { registerTerminal } from "./components/terminal";
import manifest from "./manifest.json";

const CONTACT_SENT_AT_KEY = "contact-sent-at";

function readContactSentAt(): number | null {
  try {
    const value = Number(localStorage.getItem(CONTACT_SENT_AT_KEY));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

registerCommandLine();
registerCommandPalette();
registerContactForm();
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

Alpine.store("contact", {
  sending: false,
  sentAt: readContactSentAt(),
  markSent() {
    this.sentAt = Date.now();
    try {
      localStorage.setItem(CONTACT_SENT_AT_KEY, String(this.sentAt));
    } catch {}
  },
});

window.Alpine = Alpine;
Alpine.start();