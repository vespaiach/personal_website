import type { FolderSource, ListingEntry } from "./collect.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function childPath(parentPath: string, name: string): string {
  return parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
}

function renderLevel(
  path: string,
  prefix: string,
  foldersByPath: Map<string, ListingEntry[]>,
  lines: string[],
): void {
  const entries = [...(foldersByPath.get(path) ?? [])].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const color = entry.isDirectory ? "var(--dir)" : "var(--ink)";

    lines.push(
      '<div style="font-family: var(--font-code); font-size: var(--code-size); ' +
        'line-height: var(--code-leading); white-space: pre;">' +
        `<span style="color: var(--text-faint);">${prefix}${branch}</span>` +
        `<span style="color: ${color};">${escapeHtml(entry.name)}</span>` +
        "</div>",
    );

    if (entry.isDirectory) {
      renderLevel(childPath(path, entry.name), `${prefix}${isLast ? "    " : "│   "}`, foldersByPath, lines);
    }
  });
}

export function renderTreeView(folders: FolderSource[]): string {
  const foldersByPath = new Map(folders.map((folder) => [folder.virtualPath, folder.entries]));
  const lines: string[] = [];
  renderLevel("/", "", foldersByPath, lines);

  return (
    '<article style="max-width: 720px; display: flex; flex-direction: column; margin: 16px 0 34px;">' +
    '<div style="font-family: var(--font-code); font-size: var(--code-size); ' +
    'line-height: var(--code-leading); color: var(--ink);">~</div>' +
    lines.join("") +
    "</article>"
  );
}