import { readFileSync } from "node:fs";
import { posix } from "node:path";
import { parseFrontmatter } from "../lib/markdown.ts";
import { resolveTitle } from "../lib/markedFragment.ts";
import type { Source } from "./collect.ts";
import { type Article, SITE_DESCRIPTION, SITE_NAME } from "./renderHead.ts";

export interface PageMeta {
  title: string;
  description?: string;
  article?: Article;
}

export const HOME_META: PageMeta = {
  title: "Trinh Nguyen's Web Development Blog",
  description: SITE_DESCRIPTION,
};

const SECTION_META: Record<string, PageMeta> = {
  "/posts": {
    title: "Web Development Posts",
    description:
      "All posts by Trinh Nguyen: hands-on notes and tutorials on JavaScript, TypeScript, React, " +
      "Tailwind CSS, Ruby on Rails, WordPress and server setup.",
  },
  "/topics": {
    title: "Posts by Topic",
    description:
      "Browse Trinh Nguyen's posts by topic, from JavaScript, TypeScript and React to Nginx, PostgreSQL, " +
      "DNS and WordPress.",
  },
  "/about": {
    title: "About Trinh Nguyen",
    description:
      "About Trinh Nguyen, a full-stack web developer building for the web since 2006: bio, resume, " +
      "tech stack and projects.",
  },
  "/about/projects": {
    title: "Projects by Trinh Nguyen",
    description:
      "A selection of projects built by Trinh Nguyen, a full-stack web developer working with TypeScript, " +
      "React, Ruby on Rails and WordPress.",
  },
  "/about/stack.json": {
    title: "Trinh Nguyen's Tech Stack",
    description:
      "Trinh Nguyen's tech stack: JavaScript, TypeScript, Ruby and PHP with React, Next.js, Alpine.js, " +
      "Ruby on Rails, WordPress, PostgreSQL, Vite and Nginx.",
  },
};

function isoDate(value: string): string {
  return new Date(value).toISOString();
}

export function metaFor(source: Source): PageMeta {
  const sectionMeta = SECTION_META[source.virtualPath];
  if (sectionMeta) return sectionMeta;

  const name = posix.basename(source.virtualPath);
  if (source.type === "folder") {
    const titles = source.entries.map((entry) => entry.title ?? entry.name).join(", ");
    return { title: `Posts about ${name}`, description: `Posts about ${name} on ${SITE_NAME}: ${titles}.` };
  }

  const { fm, body } = parseFrontmatter(readFileSync(source.filePath, "utf-8"));
  return {
    title: resolveTitle(fm, body.trimStart()).title || name,
    description: fm.description ?? fm.excerpt,
    article: fm.date
      ? {
          published: isoDate(fm.date),
          modified: isoDate(fm.updatedAt ?? fm.date),
          tags: (fm.tags ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }
      : undefined,
  };
}