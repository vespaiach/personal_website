import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type PostEntry, readPosts } from "../lib/utils.ts";

function renderRow(post: PostEntry): string {
  return `  <li>
    <span>-rw-r--r--</span>
    <span>${post.readTime}</span>
    <time datetime="${post.lsDate}">${post.lsDate}</time>
    <button type="button">${post.slug}.md</button>
  </li>`;
}

export function renderPostsListingPartial(posts: PostEntry[]): string {
  return `<ul class="posts-listing-row">
  <li class="total">total ${posts.length}</li>
${posts.map(renderRow).join("\n")}
</ul>
`;
}

export function generatePostsListing(root: string): void {
  const posts = readPosts(join(root, "content"));
  const outputDir = join(root, "src", "generated");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "posts-listing.html"), renderPostsListingPartial(posts));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generatePostsListing(process.cwd());
}