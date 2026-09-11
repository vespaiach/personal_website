import Alpine from "alpinejs";

export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

// Dummy data — TODO: replace with import.meta.glob('/content/posts/*.md')
// + frontmatter parsing (see src/lib/markdown.ts).
const DUMMY_POSTS: PostSummary[] = [
  {
    slug: "sample-post-1",
    title: "Sample Post One",
    date: "2025-01-01",
    excerpt: "Placeholder excerpt — replace with real post content.",
    tags: ["sample"],
  },
  {
    slug: "sample-post-2",
    title: "Sample Post Two",
    date: "2025-01-02",
    excerpt: "Another placeholder excerpt.",
    tags: ["dummy"],
  },
];

export function registerPostList() {
  Alpine.data("postList", () => ({
    loading: true,
    posts: [] as PostSummary[],
    async init() {
      this.posts = DUMMY_POSTS;
      this.loading = false;
    },
    open(slug: string) {
      Alpine.store("reader")?.load(slug);
    },
  }));
}