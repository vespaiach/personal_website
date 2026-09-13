// TODO: port hsize from the original DCLogic class.
export function humanSize(bytes: number): string {
  return `${bytes}B`;
}

export function readTime(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 6 / 220))} min`;
}

const MONTH_ABBREVIATIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Formats an ISO date string as an `ls -l`-style date, e.g. "Jun 6 2025".
export function lsDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTH_ABBREVIATIONS[date.getUTCMonth()]} ${date.getUTCDate()} ${date.getUTCFullYear()}`;
}