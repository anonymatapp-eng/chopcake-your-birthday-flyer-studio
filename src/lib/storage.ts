import type { Birthday, Prefs, Profile, Template } from "@/types";
import { seedTemplates } from "@/data/seedTemplates";

const KEYS = {
  templates: "chopcake:templates",
  birthdays: "chopcake:birthdays",
  profile: "chopcake:profile",
  prefs: "chopcake:prefs",
  adminSession: "chopcake:adminSession",
  seeded: "chopcake:seeded",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("chopcake:change", { detail: { key } }));
}

// One-time seed
export function ensureSeed() {
  if (localStorage.getItem(KEYS.seeded)) return;
  write(KEYS.templates, seedTemplates);
  write(KEYS.birthdays, [] as Birthday[]);
  write(KEYS.profile, defaultProfile());
  write(KEYS.prefs, defaultPrefs());
  localStorage.setItem(KEYS.seeded, "1");
}

export function defaultProfile(): Profile {
  return { displayName: "Friend", flyersMade: 0, streak: 0, shareToCommunity: false };
}
export function defaultPrefs(): Prefs {
  return { notificationsEnabled: false, reminderHour: 9, watermark: true };
}

export const storage = {
  // templates
  getTemplates: () => read<Template[]>(KEYS.templates, seedTemplates),
  setTemplates: (t: Template[]) => write(KEYS.templates, t),
  upsertTemplate: (t: Template) => {
    const all = storage.getTemplates();
    const idx = all.findIndex((x) => x.id === t.id);
    if (idx >= 0) all[idx] = t;
    else all.unshift(t);
    storage.setTemplates(all);
  },
  deleteTemplate: (id: string) => storage.setTemplates(storage.getTemplates().filter((t) => t.id !== id)),
  incrementUsage: (id: string) => {
    const all = storage.getTemplates();
    const t = all.find((x) => x.id === id);
    if (t) {
      t.usageCount += 1;
      storage.setTemplates(all);
    }
  },

  // birthdays
  getBirthdays: () => read<Birthday[]>(KEYS.birthdays, []),
  setBirthdays: (b: Birthday[]) => write(KEYS.birthdays, b),
  upsertBirthday: (b: Birthday) => {
    const all = storage.getBirthdays();
    const idx = all.findIndex((x) => x.id === b.id);
    if (idx >= 0) all[idx] = b;
    else all.push(b);
    storage.setBirthdays(all);
  },
  deleteBirthday: (id: string) => storage.setBirthdays(storage.getBirthdays().filter((b) => b.id !== id)),

  // profile
  getProfile: () => read<Profile>(KEYS.profile, defaultProfile()),
  setProfile: (p: Profile) => write(KEYS.profile, p),

  // prefs
  getPrefs: () => read<Prefs>(KEYS.prefs, defaultPrefs()),
  setPrefs: (p: Prefs) => write(KEYS.prefs, p),

  // admin
  isAdminLoggedIn: () => sessionStorage.getItem(KEYS.adminSession) === "1" || localStorage.getItem(KEYS.adminSession) === "1",
  loginAdmin: (remember: boolean) => {
    if (remember) localStorage.setItem(KEYS.adminSession, "1");
    else sessionStorage.setItem(KEYS.adminSession, "1");
  },
  logoutAdmin: () => {
    sessionStorage.removeItem(KEYS.adminSession);
    localStorage.removeItem(KEYS.adminSession);
  },

  // demo
  loadDemoBirthdays: () => {
    import("@/data/seedBirthdays").then((m) => storage.setBirthdays(m.seedBirthdays));
  },
};

export const ADMIN_PASSWORD = "chopcake2025";
