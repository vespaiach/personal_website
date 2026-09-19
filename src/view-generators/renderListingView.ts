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
    '<div style="display: flex; gap: 16px; font-family: var(--font-code); font-size: var(--code-size); ' +
    'line-height: var(--code-leading); color: var(--text-body);">' +
    `<span style="color: var(--text-mute); width: 96px; flex: none;">${permissions}</span>` +
    `<span style="color: var(--text-mute); width: 56px; flex: none;">${escapeHtml(entry.size)}</span>` +
    `<span style="color: var(--text-mute); width: 96px; flex: none;">${dateContent}</span>` +
    `<span style="color: var(--text-strong);">${nameElement}</span>` +
    "</div>"
  );
}

export function renderListingView(virtualPath: string, entries: ListingEntry[]): string {
  const rows = entries.map((entry) => renderRow(entry, virtualPath)).join("");

  return (
    '<article style="max-width: 720px; display: flex; flex-direction: column; gap: 12px; margin: 16px 0 34px;">' +
    '<div style="font-family: var(--font-code); font-size: 12px; letter-spacing: 0.04em; ' +
    `color: var(--text-faint);">~${escapeHtml(virtualPath)}</div>` +
    '<hr style="border: 0; height: 1px; margin: 0; background: var(--hairline);">' +
    '<div style="font-family: var(--font-code); font-size: var(--code-size); ' +
    `color: var(--text-mute);">total ${entries.length}</div>` +
    `${rows}` +
    "</article>"
  );
}