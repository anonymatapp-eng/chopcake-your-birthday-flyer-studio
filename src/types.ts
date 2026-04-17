// Domain types for ChopCake. Designed to migrate to Lovable Cloud later.

export interface Zone {
  // Normalized 0-1 coordinates relative to template background
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  category: string;
  // data: URL of background image (1080x1080 required)
  background: string;
  photoZone: Zone;
  nameZone: Zone;
  messageZone: Zone;
  nameColor: string; // hsl or hex
  messageColor: string;
  active: boolean;
  usageCount: number;
  createdAt: number;
}

export interface Birthday {
  id: string;
  name: string;
  // ISO yyyy-mm-dd; year is reference birth year (used for age calc)
  date: string;
  photo?: string; // data URL
  notes?: string;
  createdAt: number;
}

export interface Profile {
  displayName: string;
  avatar?: string;
  flyersMade: number;
  streak: number;
  lastActiveDate?: string; // yyyy-mm-dd
  shareToCommunity: boolean;
}

export interface Prefs {
  notificationsEnabled: boolean;
  reminderHour: number; // 0-23
  watermark: boolean;
}
