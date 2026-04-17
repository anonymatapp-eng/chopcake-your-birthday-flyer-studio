import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar as CalIcon, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBirthdays, usePrefs } from "@/hooks/useStorage";
import { storage } from "@/lib/storage";
import { ageTurning, daysUntil, formatDateLabel, sortByUpcoming } from "@/lib/birthdays";
import { colorForName, getInitials } from "@/lib/avatar";
import type { Birthday } from "@/types";
import { requestNotificationPermission, scheduleReminders } from "@/lib/reminders";
import { toast } from "@/hooks/use-toast";

export default function Birthdays() {
  const [list] = useBirthdays();
  const [prefs, refreshPrefs] = usePrefs();
  const sorted = sortByUpcoming(list);
  const [editing, setEditing] = useState<Birthday | null>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());

  const monthDates = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);

  const birthdayMap = useMemo(() => {
    const map: Record<string, Birthday[]> = {};
    list.forEach((b) => {
      const [, m, d] = b.date.split("-");
      const key = `${m}-${d}`;
      (map[key] = map[key] || []).push(b);
    });
    return map;
  }, [list]);

  const enableReminders = async () => {
    const ok = await requestNotificationPermission();
    if (!ok) {
      toast({ title: "Notifications blocked", description: "Enable them in your browser settings.", variant: "destructive" });
      return;
    }
    storage.setPrefs({ ...prefs, notificationsEnabled: true });
    refreshPrefs();
    scheduleReminders();
    toast({ title: "Reminders on 🎉", description: "We'll nudge you the day before and the morning of." });
  };

  return (
    <div className="container py-6 md:py-10 max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-4xl font-bold">My birthdays</h1>
          <p className="text-sm text-muted-foreground">All the dates that matter, in one place.</p>
        </div>
        <div className="flex gap-2">
          {!prefs.notificationsEnabled && (
            <Button variant="outline" onClick={enableReminders}>
              <Bell className="h-4 w-4" /> Enable reminders
            </Button>
          )}
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)} className="gradient-primary text-primary-foreground rounded-full font-semibold">
                <Plus className="h-4 w-4" /> Add birthday
              </Button>
            </DialogTrigger>
            <BirthdayDialog editing={editing} onClose={() => setOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-4 md:p-6 bg-card-elevated border-border/60">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</Button>
          <div className="font-display font-bold">
            {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-center">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDates.map((d, i) => {
            const inMonth = d.getMonth() === month.getMonth();
            const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const has = birthdayMap[key];
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative ${
                  inMonth ? "text-foreground" : "text-muted-foreground/40"
                } ${isToday ? "bg-primary/15 text-primary font-bold" : ""}`}
              >
                {d.getDate()}
                {has && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* List */}
      <section>
        <h2 className="font-display text-xl font-bold mb-3">Coming up</h2>
        {sorted.length === 0 ? (
          <Card className="p-8 text-center bg-card-elevated border-dashed">
            <div className="text-4xl mb-2">📅</div>
            <div className="font-display text-lg font-bold">Nothing here yet</div>
            <p className="text-sm text-muted-foreground mb-4">Add your first birthday to get started.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Add birthday</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {sorted.map((b) => (
              <Card key={b.id} className="p-3 md:p-4 bg-card-elevated border-border/60 flex items-center gap-3 md:gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: b.photo ? "transparent" : colorForName(b.name) }}
                >
                  {b.photo ? <img src={b.photo} alt="" className="h-full w-full object-cover rounded-xl" /> : getInitials(b.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{b.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <CalIcon className="h-3 w-3" /> {formatDateLabel(b)} · turning {ageTurning(b)}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/15 text-primary">
                  {daysUntil(b) === 0 ? "Today!" : `${daysUntil(b)}d`}
                </span>
                <div className="flex gap-1">
                  <Button asChild size="icon" variant="ghost"><Link to={`/create?birthday=${b.id}`}><Sparkles className="h-4 w-4" /></Link></Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { storage.deleteBirthday(b.id); toast({ title: "Removed" }); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BirthdayDialog({ editing, onClose }: { editing: Birthday | null; onClose: () => void }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [date, setDate] = useState(editing?.date ?? "1995-01-01");
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const onPhoto = (file?: File | null) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(file);
  };

  const save = () => {
    if (!name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const b: Birthday = {
      id: editing?.id ?? crypto.randomUUID(),
      name: name.trim(),
      date,
      photo,
      notes: notes.trim() || undefined,
      createdAt: editing?.createdAt ?? Date.now(),
    };
    storage.upsertBirthday(b);
    scheduleReminders();
    toast({ title: editing ? "Updated" : "Added 🎉" });
    onClose();
  };

  return (
    <DialogContent className="bg-card border-border">
      <DialogHeader>
        <DialogTitle className="font-display">{editing ? "Edit birthday" : "Add a birthday"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya Chen" />
        </div>
        <div>
          <Label>Birth date (recurring annually)</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Photo (optional)</Label>
          <div className="flex items-center gap-3 mt-1">
            {photo && <img src={photo} alt="" className="h-12 w-12 rounded-xl object-cover" />}
            <Button asChild variant="outline" size="sm">
              <label>Upload<input type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} /></label>
            </Button>
            {photo && <Button variant="ghost" size="sm" onClick={() => setPhoto(undefined)}>Remove</Button>}
          </div>
        </div>
        <div>
          <Label>Private notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Loves matcha…" rows={2} />
        </div>
        <Button onClick={save} className="w-full gradient-primary text-primary-foreground">
          {editing ? "Save changes" : "Add birthday"}
        </Button>
      </div>
    </DialogContent>
  );
}
