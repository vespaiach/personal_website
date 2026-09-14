import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lsDate } from "../lib/format.ts";
import { type PostEntry, readPosts } from "../lib/utils.ts";

export type TopicListing = {
  name: string;
  count: number;
  date: string;
  isoDate: string;
};

export function deriveTopicListings(posts: Pick<PostEntry, "date" | "tags">[]): TopicListing[] {
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

  return [...topics.entries()]
    .map(([name, topic]) => ({
      name,
      count: topic.count,
      date: lsDate(topic.isoDate),
      isoDate: topic.isoDate,
    }))
    .sort((left, right) => right.isoDate.localeCompare(left.isoDate) || left.name.localeCompare(right.name));
}

function renderRow(topic: TopicListing): string {
  return `  <li>
    <span>drwxr-xr-x</span>
    <span>-</span>
    <time datetime="${topic.isoDate}">${topic.date}</time>
    <button type="button" aria-label="${topic.count} posts">${topic.name}</button>
  </li>`;
}

export function renderTopicsListingPartial(topics: TopicListing[]): string {
  return `<ul class="topics-listing-row">
  <li class="total">total ${topics.length}</li>
${topics.map(renderRow).join("\n")}
</ul>
`;
}

export function generateTopicsListing(root: string): void {
  const topics = deriveTopicListings(readPosts(join(root, "content")));
  const outputDir = join(root, "src", "generated");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "topics-listing.html"), renderTopicsListingPartial(topics));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateTopicsListing(process.cwd());
}