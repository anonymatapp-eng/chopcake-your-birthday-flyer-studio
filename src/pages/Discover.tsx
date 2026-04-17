import { Link } from "react-router-dom";
import { Flame, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTemplates } from "@/hooks/useStorage";

export default function Discover() {
  const [templates] = useTemplates();
  const trending = [...templates].filter((t) => t.active).sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="container py-6 md:py-10 max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-4xl font-bold">Discover</h1>
        <p className="text-sm text-muted-foreground">Trending templates and inspiration from the community.</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl font-bold">Trending templates</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trending.map((t, i) => (
            <Link
              key={t.id}
              to={`/create?template=${t.id}`}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-border/60 hover:border-primary/40 transition-spring shadow-elev-sm"
            >
              <img src={t.background} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/30 backdrop-blur text-[10px] text-white font-semibold">
                #{i + 1} {i === 0 && <Flame className="inline h-3 w-3 ml-0.5 text-secondary" />}
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <div className="text-sm font-semibold flex items-center gap-1">
                  <span>{t.emoji}</span> {t.name}
                </div>
                <div className="text-[10px] opacity-80">{t.usageCount} flyers · {t.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Inspiration wall</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {trending.slice(0, 6).map((t, i) => (
            <Card key={`insp-${t.id}-${i}`} className="aspect-[9/16] relative overflow-hidden bg-card border-border/60">
              <img src={t.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold">
                @celebrator{i + 1}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
