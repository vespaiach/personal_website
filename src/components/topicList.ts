import Alpine from "alpinejs";

export interface Topic {
  name: string;
  count: number;
}

// Dummy data for now — TODO: derive from postList's real posts[], grouped
// by tag, once that loads real content.
export function registerTopicList() {
  Alpine.data("topicList", () => ({
    topics: [
      { name: "sample", count: 1 },
      { name: "dummy", count: 1 },
    ] as Topic[],
  }));
}
