import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { isUnderDir, type PostEntry, readPosts } from "./folderListingPlugin.ts";

function renderRow(post: PostEntry): string {
  return `  <li>
    <span aria-label="permissions">-rw-r--r--</span>
    <span aria-label="read time">${post.readTime}</span>
    <span aria-label="date">${post.lsDate}</span>
    <button type="button" aria-label="filename">${post.slug}.md</button>
  </li>`;
}

export function renderPostsListingPartial(posts: PostEntry[]): string {
  return `<ul class="posts-listing-row">
  <li aria-label="total">total ${posts.length}</li>
${posts.map(renderRow).join("\n")}
</ul>
`;
}

function generatePartial(root: string): void {
  const posts = readPosts(join(root, "content"));
  const outputDir = join(root, "partials", "generated");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "posts-listing.html"), renderPostsListingPartial(posts));
}

export function postsListingPartialPlugin(): Plugin {
  let root = process.cwd();

  return {
    name: "posts-listing-partial",
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      generatePartial(root);
    },
    configureServer(server) {
      const contentDir = join(root, "content");
      server.watcher.add(contentDir);
      server.watcher.on("all", (_event, file) => {
        if (isUnderDir(file, contentDir)) generatePartial(root);
      });
    },
  };
}