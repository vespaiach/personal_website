import { posix } from "node:path";
import { postCount, shortDate } from "../lib/format.ts";
import type { ListingEntry } from "./collect.ts";
import { commandFor } from "./entryCommand.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function permissionsFor(entry: ListingEntry): string {
  if (entry.isDirectory) return "[d]";
  return entry.linkTarget ? "[t]" : "[f]";
}

function linkClassFor(entry: ListingEntry): string {
  if (entry.isDirectory) return "ls-link ls-link--dir";
  return entry.linkTarget ? "ls-link ls-link--symlink" : "ls-link";
}

function blankModifierFor(isBlank: boolean): string {
  return isBlank ? " ls-view__col--blank" : "";
}

function renderDate(entry: ListingEntry): string {
  if (!entry.isoDate) return escapeHtml(entry.date);

  return (
    `<time datetime="${escapeHtml(entry.isoDate)}">` +
    `<span class="ls-view__date--full">${escapeHtml(entry.date)}</span>` +
    `<span class="ls-view__date--short">${shortDate(entry.isoDate)}</span>` +
    "</time>"
  );
}

function renderRow(entry: ListingEntry, virtualPath: string): string {
  const titleAttr = entry.title ? ` title="${escapeHtml(entry.title)}"` : "";
  const nameElement =
    `<button class="${linkClassFor(entry)}" @click="$store.prompts.add('${escapeHtml(commandFor(entry, virtualPath))}', $store.cwd.value)"${titleAttr}>` +
    `${escapeHtml(entry.name)}</button>`;

  return (
    '<div class="ls-view__row">' +
    `<span class="ls-view__col ls-view__col--perms">${permissionsFor(entry)}</span>` +
    `<span class="ls-view__col ls-view__col--size${blankModifierFor(entry.size === "-")}">${escapeHtml(entry.size)}</span>` +
    `<span class="ls-view__col ls-view__col--date${blankModifierFor(!entry.isoDate)}">${renderDate(entry)}</span>` +
    `<span class="ls-view__col ls-view__col--name">${nameElement}</span>` +
    "</div>"
  );
}

function totalFor(virtualPath: string, count: number): string {
  if (posix.dirname(virtualPath) !== "/topics") return `total ${count}`;
  return `total ${postCount(count)} in topic ${posix.basename(virtualPath)}`;
}

export function renderListingView(virtualPath: string, entries: ListingEntry[]): string {
  const rows = entries.map((entry) => renderRow(entry, virtualPath)).join("");

  return (
    '<article class="ls-view">' +
    `<div class="ls-view__total">${escapeHtml(totalFor(virtualPath, entries.length))}</div>` +
    `${rows}` +
    "</article>"
  );
}