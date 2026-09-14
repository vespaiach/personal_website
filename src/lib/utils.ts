import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lsDate, readTime } from "../lib/format.ts";
import { parseFrontmatter } from "../lib/markdown.ts";

export interface PostEntry {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  lsDate: string;
}

function listMarkdownSlugs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .sort();
}

export function readPosts(contentDir: string): PostEntry[] {
  const dir = join(contentDir, "posts");
  return listMarkdownSlugs(dir)
    .map((slug) => {
      const raw = readFileSync(join(dir, `${slug}.md`), "utf-8");
      const { fm } = parseFrontmatter(raw);
      const date = fm.date ?? "";
      return {
        slug,
        title: fm.title ?? "",
        date,
        excerpt: fm.excerpt ?? "",
        tags: (fm.tags ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        readTime: readTime(Buffer.byteLength(raw, "utf-8")),
        lsDate: lsDate(date),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}