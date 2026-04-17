import type { Birthday, Prefs } from "@/types";
import { daysUntil, nextOccurrence } from "@/lib/birthdays";

let scheduled: number[] = [];

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

function clearScheduled() {
  scheduled.forEach((t) => clearTimeout(t));
  scheduled = [];
}

export function scheduleReminders(list: Birthday[], prefs: Prefs | null) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (!prefs?.notificationsEnabled) return;

  clearScheduled();
  const now = new Date();
  const horizon = 24 * 60 * 60 * 1000;
  list.forEach((b) => scheduleOne(b, now, horizon, prefs.reminderHour));
}

function scheduleOne(b: Birthday, now: Date, horizon: number, hour: number) {
  const next = nextOccurrence(b, now);
  const dayBefore = new Date(next);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(hour, 0, 0, 0);
  const morning = new Date(next);
  morning.setHours(hour, 0, 0, 0);

  [dayBefore, morning].forEach((when, idx) => {
    const delay = when.getTime() - now.getTime();
    if (delay > 0 && delay <= horizon) {
      const t = window.setTimeout(() => fire(b, idx === 0), delay);
      scheduled.push(t);
    }
  });
}

function fire(b: Birthday, isDayBefore: boolean) {
  const title = isDayBefore ? `Tomorrow: ${b.name}'s birthday 🎂` : `Today: ${b.name}'s birthday! 🎉`;
  const body = isDayBefore
    ? `Get ready to make ${b.name} feel celebrated.`
    : `Tap to create a flyer for ${b.name} in seconds.`;
  const n = new Notification(title, { body, tag: `cc-${b.id}` });
  n.onclick = () => {
    window.focus();
    window.location.href = `/create?birthday=${b.id}`;
  };
}

export function nextReminderInfo(list: Birthday[]): string | null {
  if (!list.length) return null;
  const sorted = [...list].sort((a, b) => daysUntil(a) - daysUntil(b));
  const b = sorted[0];
  const d = daysUntil(b);
  if (d === 0) return `Today is ${b.name}'s birthday!`;
  if (d === 1) return `${b.name}'s birthday is tomorrow.`;
  return `${b.name}'s birthday in ${d} days.`;
}
