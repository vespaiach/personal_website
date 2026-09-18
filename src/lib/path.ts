/**
 * We only have three virtual root directories: /posts, /topics, and /about.
 * ~
├── about
├── posts
└── topics
 */
export function toAbsolutePath(anyPath: string, currentPath: string): PathResult {
  const normalizedPath = anyPath.replace(/^~(?=\/|$)/, "");
  if (/\/{2,}/.test(normalizedPath)) return { valid: false, error: "Invalid path" };

  const baseSegments = normalizedPath.startsWith("/") ? [] : currentPath.split("/").filter(Boolean);
  const segments = baseSegments.concat(normalizedPath.split("/"));

  const resolved: string[] = [];
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (resolved.length === 0) return { valid: true, absolutePath: "/" };
      resolved.pop();
    } else resolved.push(segment);
  }

  const result = `/${resolved.join("/")}`;
  return result.length < 512
    ? { valid: true, absolutePath: result }
    : { valid: false, error: "Path is too long" };
}