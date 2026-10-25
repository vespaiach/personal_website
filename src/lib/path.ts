/**
 * We only have four virtual root directories: /posts, /topics, /projects, and /about.
 * ~
├── about
├── posts
├── projects
└── topics
 */
export function toAbsolutePath(anyPath: string, currentPath: string): PathResult {
  const normalizedPath = anyPath.replace(/^~(\/|$)/, "/");
  if (/\/{2,}/.test(normalizedPath)) return { valid: false, error: "Invalid path" };

  const baseSegments = normalizedPath.startsWith("/") ? [] : currentPath.split("/").filter(Boolean);
  const segments = baseSegments.concat(normalizedPath.split("/"));

  const resolved: string[] = [];
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") resolved.pop();
    else resolved.push(segment);
  }

  const result = `/${resolved.join("/")}`;
  return result.length < 512
    ? { valid: true, absolutePath: result }
    : { valid: false, error: "Path is too long" };
}