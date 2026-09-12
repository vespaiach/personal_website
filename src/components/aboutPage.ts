import Alpine from "alpinejs";

interface Project {
  name: string;
  url: string;
  what: string;
}

// Dummy data for now — TODO: fetch content/about/me.md, stack.json,
// projects.json instead of hardcoding.
export function registerAboutPage() {
  Alpine.data("aboutPage", () => ({
    bio: "Placeholder bio — replace with content/about/me.md.",
    stack: { languages: ["TypeScript"], frameworks: ["Alpine.js", "Vite"] },
    projects: [
      { name: "sample-project", url: "https://example.com", what: "Placeholder project entry." },
    ] as Project[],
  }));
}