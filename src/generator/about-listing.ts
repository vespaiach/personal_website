import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lsDate, readTime } from "../lib/format.ts";

export type AboutEntry = {
  name: string;
  type: "file" | "directory";
  readTime?: string;
  date?: string;
  isoDate?: string;
};

export function readAboutEntries(contentDir: string): AboutEntry[] {
  const aboutDir = join(contentDir, "about");
  return readdirSync(aboutDir, { withFileTypes: true })
    .map((entry) => {
      const path = join(aboutDir, entry.name);
      if (entry.isDirectory()) return { name: entry.name, type: "directory" as const };

      const isoDate = statSync(path).mtime.toISOString();
      return {
        name: entry.name,
        type: "file" as const,
        readTime: readTime(Buffer.byteLength(readFileSync(path))),
        date: lsDate(isoDate),
        isoDate,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function renderRow(entry: AboutEntry): string {
  if (entry.type === "directory") {
    return `  <li>
    <span>drwxr-xr-x</span>
    <button type="button">${entry.name}</button>
  </li>`;
  }

  return `  <li>
    <span>-rw-r--r--</span>
    <span>${entry.readTime}</span>
    <time datetime="${entry.isoDate}">${entry.date}</time>
    <button type="button">${entry.name}</button>
  </li>`;
}

export function renderAboutListingPartial(entries: AboutEntry[]): string {
  return `<ul class="about-listing-row">
  <li class="total">total ${entries.length}</li>
${entries.map(renderRow).join("\n")}
</ul>
`;
}

export function generateAboutListing(root: string): void {
  const entries = readAboutEntries(join(root, "content"));
  const outputDir = join(root, "src", "generated");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "about-listing.html"), renderAboutListingPartial(entries));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAboutListing(process.cwd());
}