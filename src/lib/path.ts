// Resolves any_path (relative or absolute) against current_path, treating
// current_path as a directory. Example: ('../posts', '/topics') -> '/posts'
export function toAbsolutePath(anyPath: string, currentPath: string): string {
  const baseSegments = anyPath.startsWith("/") ? [] : currentPath.split("/").filter(Boolean);
  const segments = baseSegments.concat(anyPath.split("/"));

  const resolved: string[] = [];
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") resolved.pop();
    else resolved.push(segment);
  }

  return `/${resolved.join("/")}`;
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
    ...import.meta.glob("/content/posts/**"),
    ...import.meta.glob("/content/about/**"),
  };

  for (const filePath of Object.keys(files)) {
    paths[filePath.replace("/content", "")] = true;
  }

  return paths;
}
