import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Birthday, Prefs, Profile, Template, Zone } from "@/types";
import { useAuth } from "@/hooks/useAuth";

// ===== mappers =====
function mapTemplate(row: any): Template {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    category: row.category,
    background: row.background,
    photoZone: row.photo_zone as Zone,
    nameZone: row.name_zone as Zone,
    messageZone: row.message_zone as Zone,
    nameColor: row.name_color,
    messageColor: row.message_color,
    active: row.active,
    usageCount: row.usage_count,
    createdAt: new Date(row.created_at).getTime(),
  };
}
function mapBirthday(row: any): Birthday {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    photo: row.photo ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}
function mapProfile(row: any): Profile {
  return {
    displayName: row.display_name,
    avatar: row.avatar_url ?? undefined,
    flyersMade: row.flyers_made,
    streak: row.streak,
    shareToCommunity: row.share_to_community,
  };
}
function mapPrefs(row: any): Prefs {
  return {
    notificationsEnabled: row.notifications_enabled,
    reminderHour: row.reminder_hour,
    watermark: row.watermark,
  };
}

// ===== templates (public read of active; admin sees all) =====
export function useTemplates(includeInactive = false) {
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    let q = supabase.from("templates").select("*").order("created_at", { ascending: false });
    if (!includeInactive) q = q.eq("active", true);
    const { data: rows } = await q;
    setData((rows ?? []).map(mapTemplate));
    setLoading(false);
  }, [includeInactive]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export const templateApi = {
  async upsert(t: Template) {
    const payload = {
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      category: t.category,
      background: t.background,
      photo_zone: t.photoZone as any,
      name_zone: t.nameZone as any,
      message_zone: t.messageZone as any,
      name_color: t.nameColor,
      message_color: t.messageColor,
      active: t.active,
      usage_count: t.usageCount,
    };
    const { error } = await supabase.from("templates").upsert(payload);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) throw error;
  },
  async incrementUsage(id: string, current: number) {
    await supabase.from("templates").update({ usage_count: current + 1 }).eq("id", id);
  },
};

// ===== birthdays (per-user) =====
export function useBirthdays() {
  const { user } = useAuth();
  const [data, setData] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    const { data: rows } = await supabase.from("birthdays").select("*").eq("user_id", user.id).order("date");
    setData((rows ?? []).map(mapBirthday));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export const birthdayApi = {
  async upsert(b: Birthday, userId: string) {
    const payload = {
      id: b.id,
      user_id: userId,
      name: b.name,
      date: b.date,
      photo: b.photo ?? null,
      notes: b.notes ?? null,
    };
    const { error } = await supabase.from("birthdays").upsert(payload);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("birthdays").delete().eq("id", id);
    if (error) throw error;
  },
};

// ===== profile =====
export function useProfile() {
  const { user } = useAuth();
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setData(null); setLoading(false); return; }
    const { data: row } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    setData(row ? mapProfile(row) : null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export const profileApi = {
  async update(userId: string, patch: Partial<Profile>) {
    const payload: any = {};
    if (patch.displayName !== undefined) payload.display_name = patch.displayName;
    if (patch.avatar !== undefined) payload.avatar_url = patch.avatar;
    if (patch.flyersMade !== undefined) payload.flyers_made = patch.flyersMade;
    if (patch.streak !== undefined) payload.streak = patch.streak;
    if (patch.shareToCommunity !== undefined) payload.share_to_community = patch.shareToCommunity;
    const { error } = await supabase.from("profiles").update(payload).eq("user_id", userId);
    if (error) throw error;
  },
};

// ===== prefs =====
export function usePrefs() {
  const { user } = useAuth();
  const [data, setData] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setData(null); setLoading(false); return; }
    const { data: row } = await supabase.from("user_prefs").select("*").eq("user_id", user.id).maybeSingle();
    setData(row ? mapPrefs(row) : null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export const prefsApi = {
  async update(userId: string, patch: Partial<Prefs>) {
    const payload: any = {};
    if (patch.notificationsEnabled !== undefined) payload.notifications_enabled = patch.notificationsEnabled;
    if (patch.reminderHour !== undefined) payload.reminder_hour = patch.reminderHour;
    if (patch.watermark !== undefined) payload.watermark = patch.watermark;
    const { error } = await supabase.from("user_prefs").update(payload).eq("user_id", userId);
    if (error) throw error;
  },
};
