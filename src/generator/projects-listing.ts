import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lsDate, readTime } from "../lib/format.ts";

export type ProjectEntry = {
  name: string;
  type: "file";
  readTime: string;
  date: string;
  isoDate: string;
};

export function readProjectEntries(contentDir: string): ProjectEntry[] {
  const projectsDir = join(contentDir, "about", "projects");
  return readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const path = join(projectsDir, entry.name);
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

function renderRow(project: ProjectEntry): string {
  return `  <li>
    <span>-rw-r--r--</span>
    <span>${project.readTime}</span>
    <time datetime="${project.isoDate}">${project.date}</time>
    <button type="button">${project.name}</button>
  </li>`;
}

export function renderProjectsListingPartial(projects: ProjectEntry[]): string {
  return `<ul class="projects-listing-row">
  <li class="total">total ${projects.length}</li>
${projects.map(renderRow).join("\n")}
</ul>
`;
}

export function generateProjectsListing(root: string): void {
  const projects = readProjectEntries(join(root, "content"));
  const outputDir = join(root, "src", "generated");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "projects-listing.html"), renderProjectsListingPartial(projects));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateProjectsListing(process.cwd());
}