import type { Birthday } from "@/types";

export function nextOccurrence(b: Birthday, from = new Date()): Date {
  const [, m, d] = b.date.split("-").map(Number);
  const year = from.getFullYear();
  let next = new Date(year, m - 1, d);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (next < today) next = new Date(year + 1, m - 1, d);
  return next;
}

export function daysUntil(b: Birthday, from = new Date()): number {
  const next = nextOccurrence(b, from);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

export function ageTurning(b: Birthday, from = new Date()): number {
  const birthYear = Number(b.date.split("-")[0]);
  return nextOccurrence(b, from).getFullYear() - birthYear;
}

export function sortByUpcoming(list: Birthday[]): Birthday[] {
  return [...list].sort((a, b) => daysUntil(a) - daysUntil(b));
}

export function formatDateLabel(b: Birthday): string {
  const next = nextOccurrence(b);
  return next.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
