import { posix } from "node:path";
import type { ListingEntry } from "./collect.ts";

export function commandFor(entry: ListingEntry, folderPath: string): string {
  const fullPath = posix.join(folderPath, entry.name);
  if (entry.isDirectory) return `cd ~${fullPath} && ls`;
  return `cat ${entry.linkTarget ? posix.resolve(folderPath, entry.linkTarget) : fullPath}`;
}