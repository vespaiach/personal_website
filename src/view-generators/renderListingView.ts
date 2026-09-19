import type { ListingEntry } from "./collect.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRow(entry: ListingEntry, virtualPath: string): string {
  const permissions = entry.isDirectory ? "drwxr-xr-x" : "-rw-r--r--";
  const dateContent = entry.isoDate
    ? `<time datetime="${escapeHtml(entry.isoDate)}">${escapeHtml(entry.date)}</time>`
    : escapeHtml(entry.date);

  const fullPath = virtualPath === "/" ? `/${entry.name}` : `${virtualPath}/${entry.name}`;
  const command = entry.isDirectory ? "ls" : "cat";
  const titleAttr = entry.title ? ` title="${escapeHtml(entry.title)}"` : "";
  const nameElement =
    `<button class="ls-link" @click="$store.prompts.add('${command} ${escapeHtml(fullPath)}', $store.cwd.value)"${titleAttr}>` +
    `${escapeHtml(entry.name)}</button>`;

  return (
    '<div class="ls-view__row">' +
    `<span class="ls-view__col ls-view__col--perms">${permissions}</span>` +
    `<span class="ls-view__col ls-view__col--size">${escapeHtml(entry.size)}</span>` +
    `<span class="ls-view__col ls-view__col--date">${dateContent}</span>` +
    `<span class="ls-view__col ls-view__col--name">${nameElement}</span>` +
    "</div>"
  );
}

export function renderListingView(virtualPath: string, entries: ListingEntry[]): string {
  const rows = entries.map((entry) => renderRow(entry, virtualPath)).join("");

  return (
    '<article class="ls-view">' +
    `<div class="view-eyebrow">~${escapeHtml(virtualPath)}</div>` +
    '<hr class="view-rule">' +
    `<div class="ls-view__total">total ${entries.length}</div>` +
    `${rows}` +
    "</article>"
  );
}