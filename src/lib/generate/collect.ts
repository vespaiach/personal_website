import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { lsDate, readTime } from "../format.ts";
import { readPosts } from "../utils.ts";

export type ContentKind = "markdown" | "json";

export interface FileSource {
  type: "file";
  virtualPath: string;
  filePath: string;
  kind: ContentKind;
}

export interface ListingEntry {
  name: string;
  isDirectory: boolean;
  size: string;
  date: string;
  isoDate: string;
}

export interface FolderSource {
  type: "folder";
  virtualPath: string;
  entries: ListingEntry[];
}

export type Source = FileSource | FolderSource;

function kindFor(filePath: string): ContentKind {
  return extname(filePath) === ".json" ? "json" : "markdown";
}

export function collectFileSources(contentDir: string): FileSource[] {
  const sources: FileSource[] = [];

  const postsDir = join(contentDir, "posts");
  if (existsSync(postsDir)) {
    for (const file of readdirSync(postsDir).filter((f) => f.endsWith(".md"))) {
      const filePath = join(postsDir, file);
      sources.push({ type: "file", virtualPath: `/posts/${file}`, filePath, kind: kindFor(filePath) });
    }
  }

  const aboutMePath = join(contentDir, "about", "me.md");
  if (existsSync(aboutMePath)) {
    sources.push({
      type: "file",
      virtualPath: "/about/me.md",
      filePath: aboutMePath,
      kind: kindFor(aboutMePath),
    });
  }

  const stackJsonPath = join(contentDir, "about", "stack.json");
  if (existsSync(stackJsonPath)) {
    sources.push({
      type: "file",
      virtualPath: "/about/stack.json",
      filePath: stackJsonPath,
      kind: kindFor(stackJsonPath),
    });
  }

  const projectsDir = join(contentDir, "about", "projects");
  if (existsSync(projectsDir)) {
    for (const file of readdirSync(projectsDir).filter((f) => f.endsWith(".md"))) {
      const filePath = join(projectsDir, file);
      sources.push({
        type: "file",
        virtualPath: `/about/projects/${file}`,
        filePath,
        kind: kindFor(filePath),
      });
    }
  }

  return sources.sort((left, right) => left.virtualPath.localeCompare(right.virtualPath));
}

function dashEntry(name: string): ListingEntry {
  return { name, isDirectory: true, size: "-", date: "-", isoDate: "" };
}

function fileEntry(name: string, filePath: string, isoDate: string): ListingEntry {
  return {
    name,
    isDirectory: false,
    size: readTime(Buffer.byteLength(readFileSync(filePath))),
    date: lsDate(isoDate),
    isoDate,
  };
}

function rootFolder(): FolderSource {
  return {
    type: "folder",
    virtualPath: "/",
    entries: ["about", "posts", "topics"]
      .map(dashEntry)
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

function postsFolder(contentDir: string): FolderSource {
  const posts = readPosts(contentDir);
  return {
    type: "folder",
    virtualPath: "/posts",
    entries: posts.map((post) => ({
      name: `${post.slug}.md`,
      isDirectory: false,
      size: post.readTime,
      date: post.lsDate,
      isoDate: post.date,
    })),
  };
}

function topicsFolder(contentDir: string): FolderSource {
  const posts = readPosts(contentDir);
  const topics = new Map<string, { count: number; isoDate: string }>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const topic = topics.get(tag);
      if (topic) {
        topic.count += 1;
        if (post.date > topic.isoDate) topic.isoDate = post.date;
      } else {
        topics.set(tag, { count: 1, isoDate: post.date });
      }
    }
  }

  const entries = [...topics.entries()]
    .map(
      ([name, topic]): ListingEntry => ({
        name,
        isDirectory: true,
        size: "-",
        date: lsDate(topic.isoDate),
        isoDate: topic.isoDate,
      }),
    )
    .sort((left, right) => right.isoDate.localeCompare(left.isoDate) || left.name.localeCompare(right.name));

  return { type: "folder", virtualPath: "/topics", entries };
}

function aboutFolder(contentDir: string): FolderSource {
  const aboutDir = join(contentDir, "about");
  const entries = readdirSync(aboutDir, { withFileTypes: true })
    .map((entry): ListingEntry => {
      const entryPath = join(aboutDir, entry.name);
      if (entry.isDirectory()) return dashEntry(entry.name);
      return fileEntry(entry.name, entryPath, statSync(entryPath).mtime.toISOString());
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  return { type: "folder", virtualPath: "/about", entries };
}

function projectsFolder(contentDir: string): FolderSource {
  const projectsDir = join(contentDir, "about", "projects");
  const entries = readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      fileEntry(
        entry.name,
        join(projectsDir, entry.name),
        statSync(join(projectsDir, entry.name)).mtime.toISOString(),
      ),
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  return { type: "folder", virtualPath: "/about/projects", entries };
}

export function collectFolderSources(contentDir: string): FolderSource[] {
  const sources: FolderSource[] = [rootFolder()];

  if (existsSync(join(contentDir, "posts"))) {
    sources.push(postsFolder(contentDir));
    sources.push(topicsFolder(contentDir));
  }

  if (existsSync(join(contentDir, "about"))) sources.push(aboutFolder(contentDir));
  if (existsSync(join(contentDir, "about", "projects"))) sources.push(projectsFolder(contentDir));

  return sources.sort((left, right) => left.virtualPath.localeCompare(right.virtualPath));
}

function describeSource(source: Source): string {
  return source.type === "file" ? source.filePath : `folder ${source.virtualPath}`;
}

export function assertNoVirtualPathCollisions(sources: Source[]): void {
  const seen = new Map<string, Source>();
  for (const source of sources) {
    const existing = seen.get(source.virtualPath);
    if (existing) {
      throw new Error(
        `content-views: virtual path "${source.virtualPath}" would be generated by both ` +
          `${describeSource(existing)} and ${describeSource(source)}.`,
      );
    }
    seen.set(source.virtualPath, source);
  }
}