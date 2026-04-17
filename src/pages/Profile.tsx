import { Bell, Crown, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBirthdays, usePrefs, useProfile, profileApi, prefsApi } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { requestNotificationPermission } from "@/lib/reminders";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, role, signOut } = useAuth();
  const { data: profile, refresh: refreshProfile } = useProfile();
  const { data: prefs, refresh: refreshPrefs } = usePrefs();
  const { data: birthdays } = useBirthdays();

  if (!profile || !prefs || !user) return null;

  const updateProfile = async (patch: Partial<typeof profile>) => {
    await profileApi.update(user.id, patch);
    refreshProfile();
  };
  const updatePrefs = async (patch: Partial<typeof prefs>) => {
    await prefsApi.update(user.id, patch);
    refreshPrefs();
  };

  const toggleNotifications = async (v: boolean) => {
    if (v) {
      const ok = await requestNotificationPermission();
      if (!ok) {
        toast({ title: "Notifications blocked", variant: "destructive" });
        return;
      }
    }
    updatePrefs({ notificationsEnabled: v });
  };

  return (
    <div className="container py-6 md:py-10 max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-4xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Make ChopCake feel like yours.</p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      <Card className="p-5 bg-card-elevated border-border/60 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl gradient-cool flex items-center justify-center text-2xl font-bold">
          {profile.displayName?.[0]?.toUpperCase() ?? "🙂"}
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Display name</Label>
          <Input
            value={profile.displayName}
            onChange={(e) => refreshProfile()}
            onBlur={(e) => updateProfile({ displayName: e.target.value })}
            defaultValue={profile.displayName}
            className="mt-1"
          />
          <div className="text-[11px] text-muted-foreground mt-1 truncate">
            {user.email} {role === "admin" && <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">ADMIN</span>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Streak" value={`${profile.streak}d`} />
        <Stat label="Flyers" value={String(profile.flyersMade)} />
        <Stat label="Birthdays" value={String(birthdays.length)} />
      </div>

      <Card className="p-5 bg-card-elevated border-border/60 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="font-display font-bold">Notifications</h2>
        </div>
        <Row label="Birthday reminders" desc="Day before + morning of">
          <Switch checked={prefs.notificationsEnabled} onCheckedChange={toggleNotifications} />
        </Row>
        <Row label="Reminder time" desc="When to nudge you">
          <Input
            type="number"
            min={0}
            max={23}
            defaultValue={prefs.reminderHour}
            onBlur={(e) => updatePrefs({ reminderHour: Math.min(23, Math.max(0, Number(e.target.value))) })}
            className="w-20 text-center"
          />
        </Row>
        <Row label="Share to community" desc="Add your flyers to Discover (mock)">
          <Switch checked={profile.shareToCommunity} onCheckedChange={(v) => updateProfile({ shareToCommunity: v })} />
        </Row>
      </Card>

      <Card className="p-6 gradient-hero text-white border-none shadow-glow-purple relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
            <Crown className="h-4 w-4" /> ChopCake Pro
          </div>
          <h2 className="font-display text-2xl font-bold mt-2">Unlock premium templates & AI messages</h2>
          <ul className="mt-3 space-y-1 text-sm opacity-90">
            <li>✨ Exclusive premium templates</li>
            <li>💬 AI-generated personalized messages</li>
            <li>📤 Schedule auto-send for birthdays</li>
          </ul>
          <Button className="mt-4 bg-white text-slate-900 hover:bg-white/90 rounded-full font-semibold">
            <Sparkles className="h-4 w-4" /> Try Pro free
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 bg-card-elevated border-border/60 text-center">
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {children}
    </div>
  );
}
