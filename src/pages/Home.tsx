import { Link } from "react-router-dom";
import { Plus, Sparkles, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBirthdays, useProfile } from "@/hooks/useStorage";
import { daysUntil, formatDateLabel, sortByUpcoming } from "@/lib/birthdays";
import { storage } from "@/lib/storage";
import { colorForName, getInitials } from "@/lib/avatar";
import { nextReminderInfo } from "@/lib/reminders";

export default function Home() {
  const [birthdays] = useBirthdays();
  const [profile] = useProfile();
  const upcoming = sortByUpcoming(birthdays).slice(0, 8);
  const reminder = nextReminderInfo();

  return (
    <div className="container py-6 md:py-10 max-w-5xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-10 shadow-glow animate-float-up">
        <div className="absolute inset-0 bg-background/10" />
        <div className="relative space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/20 backdrop-blur px-3 py-1 text-xs font-medium text-white">
            <Sparkles className="h-3 w-3" /> {reminder ?? "Welcome to ChopCake"}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
            Make every birthday<br />feel unforgettable.
          </h1>
          <p className="text-white/85 text-sm md:text-base max-w-md">
            Create a beautiful flyer in seconds. Never miss the dates that matter.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90 shadow-elev-md rounded-full font-semibold">
              <Link to="/create">
                <Sparkles className="h-4 w-4" /> Create a Birthday Flyer
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="bg-background/15 text-white hover:bg-background/25 rounded-full font-semibold">
              <Link to="/birthdays"><Plus className="h-4 w-4" /> Add Birthday</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard icon={<Flame className="h-5 w-5 text-secondary" />} label="Streak" value={`${profile.streak} days`} />
        <StatCard icon={<Sparkles className="h-5 w-5 text-primary" />} label="Flyers made" value={String(profile.flyersMade)} />
        <StatCard icon={<Trophy className="h-5 w-5 text-teal" />} label="Birthdays saved" value={String(birthdays.length)} className="col-span-2 md:col-span-1" />
      </section>

      {/* Upcoming */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold">Upcoming birthdays</h2>
            <p className="text-sm text-muted-foreground">Tap a card to start a flyer.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/birthdays">View all</Link>
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyBirthdays />
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {upcoming.map((b) => (
              <Link
                key={b.id}
                to={`/create?birthday=${b.id}`}
                className="shrink-0 w-40 rounded-2xl bg-card border border-border/60 p-4 hover:border-primary/40 transition-spring hover:-translate-y-0.5 shadow-elev-sm"
              >
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white mb-3"
                  style={{ background: b.photo ? "transparent" : colorForName(b.name) }}
                >
                  {b.photo ? (
                    <img src={b.photo} alt="" className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    getInitials(b.name)
                  )}
                </div>
                <div className="font-semibold text-sm truncate">{b.name}</div>
                <div className="text-xs text-muted-foreground">{formatDateLabel(b)}</div>
                <DaysChip days={daysUntil(b)} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold mb-3">Your badges</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <BadgeCard emoji="🔥" name="Streak Starter" unlocked={profile.streak >= 1} />
          <BadgeCard emoji="🎂" name="First Flyer" unlocked={profile.flyersMade >= 1} />
          <BadgeCard emoji="💌" name="Consistent Celebrator" unlocked={profile.flyersMade >= 5} />
          <BadgeCard emoji="🌟" name="Flyer Pro" unlocked={profile.flyersMade >= 10} />
          <BadgeCard emoji="📅" name="Early Bird" unlocked={birthdays.length >= 3} />
          <BadgeCard emoji="💖" name="Caring Heart" unlocked={birthdays.length >= 10} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <Card className={`p-4 bg-card-elevated border-border/60 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
          <div className="font-display text-2xl font-bold mt-0.5">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">{icon}</div>
      </div>
    </Card>
  );
}

function DaysChip({ days }: { days: number }) {
  let label = `${days}d`;
  let cls = "bg-muted text-muted-foreground";
  if (days === 0) {
    label = "Today!";
    cls = "gradient-warm text-white";
  } else if (days === 1) {
    label = "Tomorrow";
    cls = "bg-secondary/20 text-secondary";
  } else if (days <= 7) {
    cls = "bg-primary/15 text-primary";
  }
  return <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{label}</span>;
}

function BadgeCard({ emoji, name, unlocked }: { emoji: string; name: string; unlocked: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center border ${unlocked ? "bg-card-elevated border-primary/30" : "bg-muted/30 border-border/40 opacity-50"}`}>
      <div className="text-2xl">{emoji}</div>
      <div className="text-[10px] mt-1 font-semibold leading-tight">{name}</div>
    </div>
  );
}

function EmptyBirthdays() {
  return (
    <Card className="p-8 text-center bg-card-elevated border-dashed border-border/60">
      <div className="text-4xl mb-2">🎈</div>
      <div className="font-display text-lg font-bold">No birthdays yet</div>
      <p className="text-sm text-muted-foreground mb-4">Add your first birthday to start celebrating.</p>
      <div className="flex justify-center">
        <Button asChild><Link to="/birthdays"><Plus className="h-4 w-4" /> Add birthday</Link></Button>
      </div>
    </Card>
  );
}
