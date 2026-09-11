import Alpine from "alpinejs";

// Fetches + renders one post's full body inline, on demand. Dummy content
// for now — TODO: fetch content/posts/<slug>.md and parse it with
// src/lib/markdown.ts.
export function registerPostReader() {
  Alpine.store("reader", {
    open: false,
    slug: "",
    title: "",
    body: "",
    load(slug: string) {
      this.open = true;
      this.slug = slug;
      this.title = `Sample: ${slug}`;
      this.body = "Placeholder body — TODO: fetch + parse the real markdown file.";
    },
  });
}