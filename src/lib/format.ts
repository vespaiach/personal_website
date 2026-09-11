// TODO: port hsize / rtime / lsdate from the original DCLogic class.
export function humanSize(bytes: number): string {
  return `${bytes}B`;
}

export function readTime(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1000))} min`;
}
