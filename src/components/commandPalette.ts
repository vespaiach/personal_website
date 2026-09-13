import Alpine from "alpinejs";
import type { Suggestion } from "../lib/commandSuggestions.ts";
import { buildSuggestions, pushRecent } from "../lib/commandSuggestions.ts";

const RECENT_STORAGE_KEY = "vespaiach:recent-commands";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveRecent(recent: string[]): void {
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // localStorage unavailable (quota exceeded, private mode) — history just won't persist.
  }
}

function virtualPathLabel(pathname: string): string {
  if (pathname.startsWith("/topics")) return "~/topics";
  if (pathname.startsWith("/about")) return "~/about";
  return "~";
}

// Global command palette store (⌘K, or the header buttons). Suggestion/history
// logic lives in ../lib/commandSuggestions.ts so it can be unit tested without
// a DOM; this file is just Alpine glue plus localStorage I/O.
export function registerCommandPalette() {
  Alpine.store("palette", {
    open: false,
    query: "",
    suggestions: [] as Suggestion[],
    selectedIndex: 0,
    historyIndex: -1,
    recent: [] as string[],
    cwdLabel: "~",

    get subtitle(): string {
      return `${this.cwdLabel} · esc to close`;
    },
    get matchLabel(): string {
      const n = this.suggestions.length;
      return `${n} ${n === 1 ? "match" : "matches"}`;
    },

    show() {
      this.recent = loadRecent();
      this.cwdLabel = virtualPathLabel(window.location.pathname);
      this.query = "";
      this.historyIndex = -1;
      this.selectedIndex = 0;
      this.refreshSuggestions();
      this.open = true;
    },
    hide() {
      this.open = false;
    },
    onInput() {
      this.historyIndex = -1;
      this.selectedIndex = 0;
      this.refreshSuggestions();
    },
    moveSelection(delta: number) {
      const max = this.suggestions.length - 1;
      this.selectedIndex = Math.min(max, Math.max(0, this.selectedIndex + delta));
    },
    onArrowUp() {
      if (!this.query && this.recent.length) {
        this.historyIndex = Math.min(this.recent.length - 1, this.historyIndex + 1);
        this.query = this.recent[this.recent.length - 1 - this.historyIndex] ?? "";
        return;
      }
      this.moveSelection(-1);
    },
    completeSelected() {
      const picked = this.suggestions[this.selectedIndex];
      if (!picked) return;
      this.query = picked.label;
      this.historyIndex = -1;
      this.selectedIndex = 0;
      this.refreshSuggestions();
    },
    runSelected() {
      const picked = this.suggestions[this.selectedIndex];
      this.runCommand(picked ? picked.label : this.query);
    },
    runSuggestion(s: Suggestion) {
      this.runCommand(s.label);
    },
    runCommand(raw: string) {
      const cmd = raw.trim();
      if (!cmd) return;
      this.recent = pushRecent(this.recent, cmd);
      saveRecent(this.recent);
      this.query = "";
      this.suggestions = [];
      this.selectedIndex = 0;
      this.historyIndex = -1;
      this.open = false;
    },
    refreshSuggestions() {
      this.suggestions = buildSuggestions(this.query, this.recent);
    },
  });
}