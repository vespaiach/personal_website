import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import type { Plugin } from "vite";
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

export interface TopicEntry {
  name: string;
  count: number;
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

export function deriveTopics(posts: PostEntry[]): TopicEntry[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function readProjectSlugs(contentDir: string): string[] {
  return listMarkdownSlugs(join(contentDir, "about", "projects"));
}

function toAttributeJson(data: unknown): string {
  return JSON.stringify(data).replace(/&/g, "&amp;").replace(/'/g, "&#39;");
}

const LISTING_CLASS = "rounded-lg bg-[#2e3440] px-4 py-3 font-mono text-[13px] leading-[21px] text-[#d8dee9]";

function renderPostsListing(posts: PostEntry[]): string {
  return `<div x-data='{ posts: ${toAttributeJson(posts)} }' class="${LISTING_CLASS}">
  <div class="text-[#616e88]">total <span x-text="posts.length"></span></div>
  <template x-for="post in posts" :key="post.slug">
    <div class="flex items-baseline gap-3 hover:text-[#88c0d0]">
      <span class="shrink-0 text-[#616e88]">-rw-r--r--</span>
      <span class="w-12 shrink-0 whitespace-nowrap text-right text-[#616e88]" x-text="post.readTime"></span>
      <span class="w-24 shrink-0 whitespace-nowrap text-[#616e88]" x-text="post.lsDate"></span>
      <span x-text="post.slug + '.md'"></span>
    </div>
  </template>
</div>
`;
}

function renderTopicsListing(topics: TopicEntry[]): string {
  return `<div x-data='{ topics: ${toAttributeJson(topics)} }' class="${LISTING_CLASS}">
  <div class="text-[#616e88]">total <span x-text="topics.length"></span></div>
  <template x-for="topic in topics" :key="topic.name">
    <div class="flex items-baseline justify-between gap-3">
      <span x-text="'#' + topic.name"></span>
      <span class="text-[#616e88]" x-text="topic.count + ' posts'"></span>
    </div>
  </template>
</div>
`;
}

const ABOUT_ENTRIES = [
  { name: "me.md", type: "file" },
  { name: "stack.json", type: "file" },
  { name: "projects", type: "dir" },
];

function renderAboutListing(): string {
  return `<div x-data='{ entries: ${toAttributeJson(ABOUT_ENTRIES)} }' class="${LISTING_CLASS}">
  <div class="text-[#616e88]">total <span x-text="entries.length"></span></div>
  <template x-for="entry in entries" :key="entry.name">
    <div class="flex items-baseline gap-3">
      <span
        class="shrink-0 text-[#616e88]"
        x-text="entry.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'"
      ></span>
      <span x-text="entry.name"></span>
    </div>
  </template>
</div>
`;
}

function renderProjectsListing(slugs: string[]): string {
  const projects = slugs.map((slug) => ({ slug }));
  return `<div x-data='{ projects: ${toAttributeJson(projects)} }' class="${LISTING_CLASS}">
  <div class="text-[#616e88]">total <span x-text="projects.length"></span></div>
  <template x-for="project in projects" :key="project.slug">
    <div class="flex items-baseline gap-3">
      <span class="shrink-0 text-[#616e88]">-rw-r--r--</span>
      <span x-text="project.slug + '.md'"></span>
    </div>
  </template>
</div>
`;
}

function generateListings(root: string): void {
  const contentDir = join(root, "content");
  const outputDir = join(root, "public", "components");
  mkdirSync(outputDir, { recursive: true });

  const posts = readPosts(contentDir);
  const topics = deriveTopics(posts);
  const projectSlugs = readProjectSlugs(contentDir);

  writeFileSync(join(outputDir, "posts-listing.html"), renderPostsListing(posts));
  writeFileSync(join(outputDir, "topics-listings.html"), renderTopicsListing(topics));
  writeFileSync(join(outputDir, "about-listings.html"), renderAboutListing());
  writeFileSync(join(outputDir, "projects-listings.html"), renderProjectsListing(projectSlugs));
}

export function isUnderDir(file: string, dir: string): boolean {
  const rel = relative(dir, file);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

export function folderListingPlugin(): Plugin {
  let root = process.cwd();

  return {
    name: "folder-listing",
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      generateListings(root);
    },
    configureServer(server) {
      const contentDir = join(root, "content");
      server.watcher.add(contentDir);
      server.watcher.on("all", (_event, file) => {
        if (isUnderDir(file, contentDir)) generateListings(root);
      });
    },
  };
}