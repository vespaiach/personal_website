import Alpine from "alpinejs";

// Global ⌘K listener + active-nav-link state.
// TODO: derive activePage from location.pathname instead of the literal
// passed in from each page's x-data="header('posts' | 'topics' | 'about')".
export function registerHeader() {
  Alpine.data("header", (activePage: string = "posts") => ({
    activePage,
    init() {
      window.addEventListener("keydown", (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          Alpine.store("palette")?.show();
        }
      });
    },
  }));
}
