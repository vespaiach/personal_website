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
    const nameClass = entry.isDirectory
      ? "tree-view__name tree-view__name--dir"
      : entry.linkTarget
        ? "tree-view__name tree-view__name--link"
        : "tree-view__name";

    lines.push(
      '<div class="tree-view__line">' +
        `<span class="tree-view__prefix">${prefix}${branch}</span>` +
        `<span class="${nameClass}">${escapeHtml(entry.name)}</span>` +
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

  return `<article class="tree-view"><div class="tree-view__root">~</div>${lines.join("")}</article>`;
}