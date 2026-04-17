import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import type { Birthday, Prefs, Profile, Template } from "@/types";

function useStorageValue<T>(read: () => T): [T, () => void] {
  const [value, setValue] = useState<T>(read);
  const refresh = () => setValue(read());
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("chopcake:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("chopcake:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return [value, refresh];
}

export const useTemplates = () => useStorageValue<Template[]>(storage.getTemplates);
export const useBirthdays = () => useStorageValue<Birthday[]>(storage.getBirthdays);
export const useProfile = () => useStorageValue<Profile>(storage.getProfile);
export const usePrefs = () => useStorageValue<Prefs>(storage.getPrefs);
