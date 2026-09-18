/**
 * We only have three virtual root directories: /posts, /topics, and /about.
 * ~
├── about
├── posts
└── topics
 */
export function toAbsolutePath(anyPath: string, currentPath: string): string | null {
  const normalizedPath = anyPath.replace(/^~(?=\/|$)/, "");
  const baseSegments = normalizedPath.startsWith("/") ? [] : currentPath.split("/").filter(Boolean);
  const segments = baseSegments.concat(normalizedPath.split("/"));

  const resolved: string[] = [];
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (resolved.length === 0) return null;
      resolved.pop();
    } else resolved.push(segment);
  }

  const result = `/${resolved.join("/")}`;
  return result;
}

// Hash of every available path (directories and files) under /posts, /topics,
// /about — built from the actual files in content/posts and content/about,
// since /topics has no content directory of its own.
export function getAvailablePaths(): Record<string, boolean> {
  const paths: Record<string, boolean> = {
    "/posts": true,
    "/topics": true,
    "/about": true,
  };

  const files = {
    ...import.meta.glob("/content/posts/**", { query: "?raw", import: "default" }),
    ...import.meta.glob("/content/about/**", { query: "?raw", import: "default" }),
  };

  for (const filePath of Object.keys(files)) {
    paths[filePath.replace("/content", "")] = true;
  }

  return paths;
}

// A path is a directory if it's one of the 3 fixed roots (even with zero
// descendants, e.g. /topics) or some existing path is nested under it —
// getAvailablePaths() never has its own entry for an intermediate directory.
export function isDirectory(path: string, paths: Record<string, boolean>): boolean {
  if (path === "/" || path === "/posts" || path === "/topics" || path === "/about") return true;
  const prefix = `${path}/`;
  return Object.keys(paths).some((key) => key.startsWith(prefix));
}