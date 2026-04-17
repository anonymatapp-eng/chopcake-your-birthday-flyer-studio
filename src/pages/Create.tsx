import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, Check, Copy, Download, RefreshCw, Share2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import FlyerCanvas, { type PhotoAdjust } from "@/components/FlyerCanvas";
import { Slider } from "@/components/ui/slider";
import { useBirthdays, usePrefs, useTemplates, prefsApi, profileApi, templateApi, useProfile } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { captionLibrary, pickThree } from "@/data/messages";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Template, Zone } from "@/types";

const MSG_LIMIT = 50;
const EXPORT_SIZE = 1080;
const EXPORT_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif";

export default function Create() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const { data: templates } = useTemplates();
  const { data: birthdays } = useBirthdays();
  const { data: prefs, refresh: refreshPrefs } = usePrefs();
  const { data: profile, refresh: refreshProfile } = useProfile();

  const [templateId, setTemplateId] = useState<string>("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoScale, setPhotoScale] = useState(1);
  const [photoOffsetX, setPhotoOffsetX] = useState(0);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);
  const [message, setMessage] = useState("");
  const [suggested, setSuggested] = useState<string[]>(pickThree());
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const id = params.get("birthday");
    if (id) {
      const b = birthdays.find((x) => x.id === id);
      if (b) {
        setName(b.name);
        if (b.photo) setPhoto(b.photo);
      }
    }
    const tplId = params.get("template");
    if (tplId) setTemplateId(tplId);
  }, [params, birthdays]);

  useEffect(() => {
    if (!templateId && templates[0]) setTemplateId(templates[0].id);
  }, [templates, templateId]);

  const template = templates.find((t) => t.id === templateId) ?? templates[0];

  const onPhoto = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setPhotoScale(1);
      setPhotoOffsetX(0);
      setPhotoOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  const exportFlyer = async () => {
    if (!template || !user || !profile) return;
    setExporting(true);
    try {
      const blob = await renderFlyerBlob({
        template,
        name,
        message,
        photo,
        photoAdjust: { scale: photoScale, offsetX: photoOffsetX, offsetY: photoOffsetY },
        watermark: prefs?.watermark ?? true,
      });

      const fileName = `chopcake-${(name || "flyer").toLowerCase().replace(/\s+/g, "-")}.png`;
      const objectUrl = URL.createObjectURL(blob);

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      const canShareFiles =
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator &&
        (navigator as any).canShare?.({ files: [new File([blob], fileName, { type: "image/png" })] });

      if (isIOS && canShareFiles) {
        const file = new File([blob], fileName, { type: "image/png" });
        await (navigator as any).share({ files: [file], title: "Birthday flyer" });
      } else if (isIOS) {
        const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
        if (!opened) window.location.href = objectUrl;
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Keep URL alive briefly for iOS Safari tabs, then release memory.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);

      await templateApi.incrementUsage(template.id, template.usageCount);
      await profileApi.update(user.id, {
        flyersMade: profile.flyersMade + 1,
        streak: Math.max(profile.streak, 1),
      });
      refreshProfile();
      setExported(true);
      if (isIOS && canShareFiles) {
        toast({ title: "Flyer ready", description: "Opened your share sheet so you can save it to Photos." });
      } else if (isIOS) {
        toast({ title: "Flyer ready", description: "The image opened in a new tab. Press and hold to save to Photos." });
      } else {
        toast({ title: "Flyer downloaded! 🎉", description: "Share it with the birthday star." });
      }
    } catch (e: any) {
      toast({ title: "Couldn't export", description: e.message ?? "Try again in a moment.", variant: "destructive" });
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
      try { await navigator.share({ title: "Birthday flyer", text: captionLibrary[0] }); } catch {}
    } else {
      copy(captionLibrary[0]);
    }
  };

  if (!template) {
    return (
      <div className="container py-20 text-center">
        <div className="text-5xl mb-3">🎨</div>
        <p className="text-muted-foreground">No templates available yet. An admin needs to create some first.</p>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-4xl font-bold">Create a flyer</h1>
        <p className="text-sm text-muted-foreground">A few taps and you're done.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr,360px] gap-6 lg:gap-10">
        <div className="space-y-6 order-2 lg:order-1">
          <section>
            <SectionHeader step={1} title="Pick a template" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden aspect-square border-2 transition-spring text-left",
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

          <section>
            <SectionHeader step={2} title="Add a photo" />
            <Card
              className="mt-3 p-4 border-dashed bg-card-elevated"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onPhoto(e.dataTransfer.files?.[0]); }}
            >
              {photo ? (
                <div className="flex items-center gap-3">
                  <img src={photo} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1 text-sm">Looking great!</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPhoto(undefined);
                      setPhotoScale(1);
                      setPhotoOffsetX(0);
                      setPhotoOffsetY(0);
                    }}
                  >
                    Remove
                  </Button>
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
                      <label><Upload className="h-4 w-4" /> Upload<input type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} /></label>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <label><Camera className="h-4 w-4" /> Camera<input type="file" accept="image/*" capture="user" hidden onChange={(e) => onPhoto(e.target.files?.[0])} /></label>
                    </Button>
                  </div>
                </div>
              )}

              {photo && (
                <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <Label className="text-xs">Zoom</Label>
                    <span className="text-muted-foreground">{photoScale.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[photoScale]}
                    min={1}
                    max={3}
                    step={0.01}
                    onValueChange={(v) => setPhotoScale(v[0] ?? 1)}
                  />

                  <div className="flex items-center justify-between text-xs">
                    <Label className="text-xs">Move left / right</Label>
                    <span className="text-muted-foreground">{Math.round(photoOffsetX * 100)}%</span>
                  </div>
                  <Slider
                    value={[photoOffsetX]}
                    min={-0.5}
                    max={0.5}
                    step={0.01}
                    onValueChange={(v) => setPhotoOffsetX(v[0] ?? 0)}
                  />

                  <div className="flex items-center justify-between text-xs">
                    <Label className="text-xs">Move up / down</Label>
                    <span className="text-muted-foreground">{Math.round(photoOffsetY * 100)}%</span>
                  </div>
                  <Slider
                    value={[photoOffsetY]}
                    min={-0.5}
                    max={0.5}
                    step={0.01}
                    onValueChange={(v) => setPhotoOffsetY(v[0] ?? 0)}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhotoScale(1);
                        setPhotoOffsetX(0);
                        setPhotoOffsetY(0);
                      }}
                    >
                      Reset photo position
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </section>

          <section>
            <SectionHeader step={3} title="Their name" />
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya" className="mt-3 h-12 text-base bg-card-elevated" maxLength={40} />
          </section>

          <section>
            <SectionHeader step={4} title="Birthday message" />
            <div className="mt-3 space-y-3">
              <div className="relative">
                <Textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, MSG_LIMIT))} placeholder="Write something warm…" rows={2} className="bg-card-elevated resize-none pr-14" />
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
                  <button key={s} onClick={() => setMessage(s.slice(0, MSG_LIMIT))} className="text-left text-sm p-3 rounded-xl border border-border/60 bg-card-elevated hover:border-primary/40 transition-smooth">
                    <Sparkles className="inline h-3 w-3 mr-1 text-primary" /> {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {prefs && (
            <section className="flex items-center justify-between p-4 rounded-2xl bg-card-elevated border border-border/60">
              <div>
                <div className="text-sm font-semibold">"Made with ChopCake" watermark</div>
                <div className="text-xs text-muted-foreground">Toggle off for a clean export</div>
              </div>
              <Switch
                checked={prefs.watermark}
                onCheckedChange={async (v) => {
                  if (!user) return;
                  await prefsApi.update(user.id, { watermark: v });
                  refreshPrefs();
                }}
              />
            </section>
          )}

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
                      <Button size="icon" variant="ghost" onClick={() => copy(c)}><Copy className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        </div>

        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
              Live preview
            </div>
            <div className="flex justify-center">
              <FlyerCanvas
                template={template}
                name={name}
                message={message}
                photo={photo}
                photoAdjust={{ scale: photoScale, offsetX: photoOffsetX, offsetY: photoOffsetY }}
                watermark={prefs?.watermark ?? true}
                width={300}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function SectionHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{step}</div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
    </div>
  );
}

function isDataUrl(src: string) {
  return src.startsWith("data:");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!isDataUrl(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function wrapWords(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] | null {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }

    const words = trimmed.split(/\s+/);
    let current = "";

    for (const word of words) {
      if (ctx.measureText(word).width > maxWidth) {
        return null;
      }

      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  rect: { x: number; y: number; w: number; h: number },
  options: { color: string; weight: number; maxSize: number; minSize?: number; align?: "center" | "left" },
) {
  const { color, weight, maxSize, minSize = 8, align = "center" } = options;
  const lineHeightFactor = 1.1;

  let lo = minSize;
  let hi = maxSize;
  let bestSize = minSize;
  let bestLines: string[] = [text];

  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    ctx.font = `${weight} ${mid}px ${EXPORT_FONT_FAMILY}`;
    const lines = wrapWords(ctx, text, rect.w);
    const fitsHeight = !!lines && lines.length * mid * lineHeightFactor <= rect.h + 1;

    if (lines && fitsHeight) {
      bestSize = mid;
      bestLines = lines;
      lo = mid;
    } else {
      hi = mid;
    }

    if (hi - lo < 0.5) break;
  }

  const lineHeight = bestSize * lineHeightFactor;
  const blockHeight = bestLines.length * lineHeight;
  const startY = rect.y + (rect.h - blockHeight) / 2;

  ctx.save();
  ctx.font = `${weight} ${bestSize}px ${EXPORT_FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  const x = align === "center" ? rect.x + rect.w / 2 : rect.x;
  bestLines.forEach((line, idx) => {
    ctx.fillText(line, x, startY + idx * lineHeight);
  });

  ctx.restore();
}

async function renderFlyerBlob({
  template,
  name,
  message,
  photo,
  photoAdjust,
  watermark,
}: {
  template: Template;
  name: string;
  message: string;
  photo?: string;
  photoAdjust: PhotoAdjust;
  watermark: boolean;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  const background = await loadImage(template.background);
  drawCoverImage(ctx, background, 0, 0, EXPORT_SIZE, EXPORT_SIZE);

  const px = (z: Zone) => ({
    x: z.x * EXPORT_SIZE,
    y: z.y * EXPORT_SIZE,
    w: z.w * EXPORT_SIZE,
    h: z.h * EXPORT_SIZE,
  });

  const photoZone = px(template.photoZone);
  ctx.save();
  roundedRectPath(ctx, photoZone.x, photoZone.y, photoZone.w, photoZone.h, 16);
  ctx.clip();

  if (photo) {
    const photoImg = await loadImage(photo);
    const zoneCenterX = photoZone.x + photoZone.w / 2;
    const zoneCenterY = photoZone.y + photoZone.h / 2;
    const moveX = photoAdjust.offsetX * photoZone.w;
    const moveY = photoAdjust.offsetY * photoZone.h;

    ctx.translate(moveX, moveY);
    ctx.translate(zoneCenterX, zoneCenterY);
    ctx.scale(photoAdjust.scale, photoAdjust.scale);
    ctx.translate(-zoneCenterX, -zoneCenterY);
    drawCoverImage(ctx, photoImg, photoZone.x, photoZone.y, photoZone.w, photoZone.h);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(photoZone.x, photoZone.y, photoZone.w, photoZone.h);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(photoZone.x + 1, photoZone.y + 1, photoZone.w - 2, photoZone.h - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `600 28px ${EXPORT_FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Photo", photoZone.x + photoZone.w / 2, photoZone.y + photoZone.h / 2);
  }
  ctx.restore();

  const nameZone = px(template.nameZone);
  drawFittedText(ctx, name || "Their Name", nameZone, {
    color: template.nameColor,
    weight: 800,
    maxSize: Math.floor(nameZone.h),
    align: "center",
  });

  const messageZone = px(template.messageZone);
  drawFittedText(ctx, message || "Your warm message here", messageZone, {
    color: template.messageColor,
    weight: 500,
    maxSize: Math.floor(messageZone.h * 0.55),
    align: "center",
  });

  if (watermark) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `500 ${Math.max(8, EXPORT_SIZE * 0.025)}px ${EXPORT_FONT_FAMILY}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 6;
    ctx.fillText("Made with ChopCake", EXPORT_SIZE - 12, EXPORT_SIZE - 8);
    ctx.restore();
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
  if (!blob) throw new Error("Could not encode flyer image");
  return blob;
}
