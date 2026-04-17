import { Link } from "react-router-dom";
import { Flame, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTemplates } from "@/hooks/useData";

export default function Discover() {
  const { data: templates } = useTemplates();
  const trending = [...templates].sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="container py-6 md:py-10 max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-4xl font-bold">Discover</h1>
        <p className="text-sm text-muted-foreground">Trending templates and inspiration from the community.</p>
      </div>

      {trending.length === 0 ? (
        <Card className="p-10 text-center bg-card-elevated border-dashed">
          <div className="text-4xl mb-2">🎨</div>
          <div className="font-display text-lg font-bold">No templates yet</div>
          <p className="text-sm text-muted-foreground">Check back soon — admins are crafting beautiful designs.</p>
        </Card>
      ) : (
        <>
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
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-border/60 hover:border-primary/40 transition-spring shadow-elev-sm"
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
        </>
      )}
    </div>
  );
}
