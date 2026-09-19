import { posix } from "node:path";
import type { ListingEntry } from "./collect.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function permissionsFor(entry: ListingEntry): string {
  if (entry.isDirectory) return "drwxr-xr-x";
  return entry.linkTarget ? "lrwxr-xr-x" : "-rw-r--r--";
}

function linkClassFor(entry: ListingEntry): string {
  if (entry.isDirectory) return "ls-link ls-link--dir";
  return entry.linkTarget ? "ls-link ls-link--symlink" : "ls-link";
}

function commandFor(entry: ListingEntry, virtualPath: string): string {
  const fullPath = posix.join(virtualPath, entry.name);
  if (entry.isDirectory) return `cd ~${fullPath} && ls`;
  return `cat ${entry.linkTarget ? posix.resolve(virtualPath, entry.linkTarget) : fullPath}`;
}

function renderRow(entry: ListingEntry, virtualPath: string): string {
  const dateContent = entry.isoDate
    ? `<time datetime="${escapeHtml(entry.isoDate)}">${escapeHtml(entry.date)}</time>`
    : escapeHtml(entry.date);

  const titleAttr = entry.title ? ` title="${escapeHtml(entry.title)}"` : "";
  const nameElement =
    `<button class="${linkClassFor(entry)}" @click="$store.prompts.add('${escapeHtml(commandFor(entry, virtualPath))}', $store.cwd.value)"${titleAttr}>` +
    `${escapeHtml(entry.name)}</button>`;

  return (
    '<div class="ls-view__row">' +
    `<span class="ls-view__col ls-view__col--perms">${permissionsFor(entry)}</span>` +
    `<span class="ls-view__col ls-view__col--size">${escapeHtml(entry.size)}</span>` +
    `<span class="ls-view__col ls-view__col--date">${dateContent}</span>` +
    `<span class="ls-view__col ls-view__col--name">${nameElement}</span>` +
    "</div>"
  );
}

function totalFor(virtualPath: string, count: number): string {
  if (posix.dirname(virtualPath) !== "/topics") return `total ${count}`;
  return `total ${count} ${count === 1 ? "post" : "posts"} in topic ${posix.basename(virtualPath)}`;
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