import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, Check, Copy, Download, RefreshCw, Share2, Sparkles, Upload } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import FlyerCanvas from "@/components/FlyerCanvas";
import { useBirthdays, usePrefs, useTemplates } from "@/hooks/useStorage";
import { storage } from "@/lib/storage";
import { captionLibrary, pickThree } from "@/data/messages";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MSG_LIMIT = 50;

export default function Create() {
  const [params] = useSearchParams();
  const [templates] = useTemplates();
  const [birthdays] = useBirthdays();
  const [prefs, refreshPrefs] = usePrefs();

  const activeTemplates = useMemo(() => templates.filter((t) => t.active), [templates]);
  const [templateId, setTemplateId] = useState<string>(activeTemplates[0]?.id ?? "");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [suggested, setSuggested] = useState<string[]>(pickThree());
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const flyerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Pre-fill from birthday param
  useEffect(() => {
    const id = params.get("birthday");
    if (id) {
      const b = birthdays.find((x) => x.id === id);
      if (b) {
        setName(b.name);
        if (b.photo) setPhoto(b.photo);
      }
    }
  }, [params, birthdays]);

  useEffect(() => {
    if (!templateId && activeTemplates[0]) setTemplateId(activeTemplates[0].id);
  }, [activeTemplates, templateId]);

  const template = activeTemplates.find((t) => t.id === templateId) ?? activeTemplates[0];

  const onPhoto = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const exportFlyer = async () => {
    if (!exportRef.current || !template) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1, cacheBust: true, width: 1080, height: 1920 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `chopcake-${(name || "flyer").toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      // Bump usage + profile flyer count
      storage.incrementUsage(template.id);
      const p = storage.getProfile();
      storage.setProfile({ ...p, flyersMade: p.flyersMade + 1, streak: Math.max(p.streak, 1) });
      setExported(true);
      toast({ title: "Flyer downloaded! 🎉", description: "Share it with the birthday star." });
    } catch (e) {
      toast({ title: "Couldn't export", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Caption ready to paste." });
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Birthday flyer", text: captionLibrary[0] });
      } catch {}
    } else {
      copy(captionLibrary[0]);
    }
  };

  if (!template) {
    return <div className="container py-20 text-center text-muted-foreground">No templates available. Visit /admin to add some.</div>;
  }

  return (
    <div className="container py-6 md:py-10 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-4xl font-bold">Create a flyer</h1>
        <p className="text-sm text-muted-foreground">A few taps and you're done.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr,360px] gap-6 lg:gap-10">
        {/* Form */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Template */}
          <section>
            <SectionHeader step={1} title="Pick a template" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {activeTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden aspect-[9/16] border-2 transition-spring text-left",
                    templateId === t.id ? "border-primary shadow-glow" : "border-transparent hover:border-border",
                  )}
                >
                  <img src={t.background} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <div className="text-xs font-semibold flex items-center gap-1">
                      <span>{t.emoji}</span> {t.name}
                    </div>
                    <div className="text-[10px] opacity-80">{t.category}</div>
                  </div>
                  {templateId === t.id && (
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Photo */}
          <section>
            <SectionHeader step={2} title="Add a photo" />
            <Card
              className="mt-3 p-4 border-dashed bg-card-elevated"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onPhoto(e.dataTransfer.files?.[0]);
              }}
            >
              {photo ? (
                <div className="flex items-center gap-3">
                  <img src={photo} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1 text-sm">Looking great!</div>
                  <Button variant="ghost" size="sm" onClick={() => setPhoto(undefined)}>Remove</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium">Drop a photo or choose one</div>
                  <div className="text-xs text-muted-foreground mb-3">PNG or JPG, square works best</div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <label>
                        <Upload className="h-4 w-4" /> Upload
                        <input type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
                      </label>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <label>
                        <Camera className="h-4 w-4" /> Camera
                        <input type="file" accept="image/*" capture="user" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
                      </label>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </section>

          {/* Name */}
          <section>
            <SectionHeader step={3} title="Their name" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya"
              className="mt-3 h-12 text-base bg-card-elevated"
              maxLength={40}
            />
          </section>

          {/* Message */}
          <section>
            <SectionHeader step={4} title="Birthday message" />
            <div className="mt-3 space-y-3">
              <div className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MSG_LIMIT))}
                  placeholder="Write something warm…"
                  rows={2}
                  className="bg-card-elevated resize-none pr-14"
                />
                <span className={cn("absolute bottom-2 right-3 text-[10px] font-medium", message.length >= MSG_LIMIT ? "text-destructive" : "text-muted-foreground")}>
                  {message.length}/{MSG_LIMIT}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Need ideas?</Label>
                <Button size="sm" variant="ghost" onClick={() => setSuggested(pickThree())}>
                  <RefreshCw className="h-3 w-3" /> Refresh
                </Button>
              </div>
              <div className="grid gap-2">
                {suggested.map((s) => (
                  <button
                    key={s}
                    onClick={() => setMessage(s.slice(0, MSG_LIMIT))}
                    className="text-left text-sm p-3 rounded-xl border border-border/60 bg-card-elevated hover:border-primary/40 transition-smooth"
                  >
                    <Sparkles className="inline h-3 w-3 mr-1 text-primary" /> {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Watermark */}
          <section className="flex items-center justify-between p-4 rounded-2xl bg-card-elevated border border-border/60">
            <div>
              <div className="text-sm font-semibold">"Made with ChopCake" watermark</div>
              <div className="text-xs text-muted-foreground">Toggle off for a clean export</div>
            </div>
            <Switch
              checked={prefs.watermark}
              onCheckedChange={(v) => {
                storage.setPrefs({ ...prefs, watermark: v });
                refreshPrefs();
              }}
            />
          </section>

          {/* Export */}
          <section>
            <SectionHeader step={5} title="Export & share" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={exportFlyer} disabled={exporting} size="lg" className="gradient-primary text-primary-foreground rounded-full font-semibold shadow-glow">
                <Download className="h-4 w-4" /> {exporting ? "Generating…" : "Generate Flyer"}
              </Button>
              <Button onClick={share} variant="outline" size="lg" className="rounded-full">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
            {exported && (
              <Card className="mt-4 p-4 bg-card-elevated border-border/60 animate-float-up">
                <div className="text-sm font-semibold mb-2">Suggested captions</div>
                <div className="space-y-2">
                  {captionLibrary.map((c) => (
                    <div key={c} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/40">
                      <span className="flex-1">{c}</span>
                      <Button size="icon" variant="ghost" onClick={() => copy(c)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        </div>

        {/* Live preview */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
              Live preview
            </div>
            <div ref={flyerRef} className="flex justify-center">
              <FlyerCanvas
                template={template}
                name={name}
                message={message}
                photo={photo}
                watermark={prefs.watermark}
                width={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Off-screen high-res export node */}
      <div style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }} aria-hidden>
        <div ref={exportRef}>
          <FlyerCanvas
            template={template}
            name={name}
            message={message}
            photo={photo}
            watermark={prefs.watermark}
            width={1080}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
        {step}
      </div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
    </div>
  );
}
