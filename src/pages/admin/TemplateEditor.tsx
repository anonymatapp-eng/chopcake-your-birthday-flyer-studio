import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import FlyerCanvas from "@/components/FlyerCanvas";
import type { Template, Zone } from "@/types";
import { templateApi } from "@/hooks/useData";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  editing: Template | null;
  onClose: () => void;
}

const defaultZones = {
  photoZone: { x: 0.2, y: 0.18, w: 0.6, h: 0.4 } as Zone,
  nameZone: { x: 0.1, y: 0.62, w: 0.8, h: 0.1 } as Zone,
  messageZone: { x: 0.1, y: 0.78, w: 0.8, h: 0.12 } as Zone,
};

const REQUIRED_BG_WIDTH = 1080;
const REQUIRED_BG_HEIGHT = 1080;

const EMOJI_OPTIONS = ["🎂", "🎉", "🎊", "✨", "🌟", "🎈", "🌸", "🎁", "💖", "🥳"];

export default function TemplateEditor({ editing, onClose }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [emoji, setEmoji] = useState(editing?.emoji ?? "🎂");
  const [category, setCategory] = useState(editing?.category ?? "Vibrant");
  const [active, setActive] = useState(editing?.active ?? true);
  const [background, setBackground] = useState<string>(editing?.background ?? "");
  const [nameColor, setNameColor] = useState(editing?.nameColor ?? "#ffffff");
  const [messageColor, setMessageColor] = useState(editing?.messageColor ?? "#ffffff");
  const [photoZone, setPhotoZone] = useState<Zone>(editing?.photoZone ?? defaultZones.photoZone);
  const [nameZone, setNameZone] = useState<Zone>(editing?.nameZone ?? defaultZones.nameZone);
  const [messageZone, setMessageZone] = useState<Zone>(editing?.messageZone ?? defaultZones.messageZone);
  const [testMode, setTestMode] = useState(false);

  const onUpload = (file?: File | null) => {
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const valid = img.naturalWidth === REQUIRED_BG_WIDTH && img.naturalHeight === REQUIRED_BG_HEIGHT;
      URL.revokeObjectURL(objectUrl);

      if (!valid) {
        toast({
          title: `Background must be ${REQUIRED_BG_WIDTH}x${REQUIRED_BG_HEIGHT}px`,
          description: `Uploaded image is ${img.naturalWidth}x${img.naturalHeight}px.`,
          variant: "destructive",
        });
        return;
      }

      const r = new FileReader();
      r.onload = () => setBackground(r.result as string);
      r.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast({ title: "Could not read image", variant: "destructive" });
    };

    img.src = objectUrl;
  };

  const save = async () => {
    if (!background) {
      toast({ title: "Upload a background image", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Template name required", variant: "destructive" });
      return;
    }
    const t: Template = {
      id: editing?.id ?? crypto.randomUUID(),
      name: name.trim(),
      emoji,
      category: category.trim() || "Other",
      background,
      photoZone,
      nameZone,
      messageZone,
      nameColor,
      messageColor,
      active,
      usageCount: editing?.usageCount ?? 0,
      createdAt: editing?.createdAt ?? Date.now(),
    };
    try {
      await templateApi.upsert(t);
      toast({ title: editing ? "Template updated" : "Template created 🎉" });
      onClose();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    }
  };

  const previewTemplate: Template = {
    id: "preview",
    name,
    emoji,
    category,
    background: background || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1080'><rect width='1080' height='1080' fill='%23222'/></svg>",
    photoZone,
    nameZone,
    messageZone,
    nameColor,
    messageColor,
    active,
    usageCount: 0,
    createdAt: 0,
  };

  return (
    <div className="grid md:grid-cols-[1fr,360px] gap-6">
      {/* Left: form */}
      <div className="space-y-4">
        <div>
          <Label>Background image (must be 1080x1080 px)</Label>
          <div className="mt-1 flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <label>
                <Upload className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files?.[0])} />
              </label>
            </Button>
            {background && <span className="text-xs text-muted-foreground">Image loaded</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Confetti Joy" />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Vibrant" />
          </div>
        </div>

        <div>
          <Label>Emoji</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center text-lg transition-smooth",
                  emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-muted/70",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Name color</Label>
            <Input type="color" value={nameColor} onChange={(e) => setNameColor(e.target.value)} className="h-10 p-1" />
          </div>
          <div>
            <Label>Message color</Label>
            <Input type="color" value={messageColor} onChange={(e) => setMessageColor(e.target.value)} className="h-10 p-1" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Zones (drag handles in preview, or fine-tune here)</Label>
          <ZoneInputs label="Photo" zone={photoZone} setZone={setPhotoZone} />
          <ZoneInputs label="Name" zone={nameZone} setZone={setNameZone} />
          <ZoneInputs label="Message" zone={messageZone} setZone={setMessageZone} />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
          <div>
            <div className="text-sm font-semibold">Active</div>
            <div className="text-xs text-muted-foreground">Visible to users</div>
          </div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={save} className="gradient-primary text-primary-foreground flex-1">
            {editing ? "Save changes" : "Create template"}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>

      {/* Right: interactive preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preview</Label>
          <Button size="sm" variant={testMode ? "default" : "outline"} onClick={() => setTestMode((v) => !v)}>
            <Eye className="h-3 w-3" /> {testMode ? "Edit zones" : "Test as user"}
          </Button>
        </div>
        <ZoneCanvas
          template={previewTemplate}
          editable={!testMode}
          setPhotoZone={setPhotoZone}
          setNameZone={setNameZone}
          setMessageZone={setMessageZone}
          testMode={testMode}
        />
      </div>
    </div>
  );
}

function ZoneInputs({ label, zone, setZone }: { label: string; zone: Zone; setZone: (z: Zone) => void }) {
  const u = (k: keyof Zone, v: number) => setZone({ ...zone, [k]: Math.max(0, Math.min(1, v)) });
  return (
    <div className="grid grid-cols-5 items-center gap-2 text-xs">
      <div className="font-semibold">{label}</div>
      {(["x", "y", "w", "h"] as const).map((k) => (
        <Input
          key={k}
          type="number"
          step={0.01}
          min={0}
          max={1}
          value={Number(zone[k].toFixed(2))}
          onChange={(e) => u(k, Number(e.target.value))}
          className="h-8 text-xs"
        />
      ))}
    </div>
  );
}

interface ZoneCanvasProps {
  template: Template;
  editable: boolean;
  testMode: boolean;
  setPhotoZone: (z: Zone) => void;
  setNameZone: (z: Zone) => void;
  setMessageZone: (z: Zone) => void;
}

function ZoneCanvas({ template, editable, testMode, setPhotoZone, setNameZone, setMessageZone }: ZoneCanvasProps) {
  const W = 320;
  const H = W;
  const ref = useRef<HTMLDivElement>(null);

  if (testMode) {
    return (
      <div className="flex justify-center">
        <FlyerCanvas
          template={template}
          name="Maya Chen"
          message="Wishing you joy that lasts all year long!"
          photo="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23a78bfa'/><text x='100' y='115' text-anchor='middle' font-size='60' font-family='Inter' fill='white'>🎂</text></svg>"
          width={W}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative mx-auto rounded-2xl overflow-hidden"
      style={{
        width: W,
        height: H,
        backgroundImage: `url(${template.background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <DraggableZone label="Photo" color="#f472b6" zone={template.photoZone} containerW={W} containerH={H} onChange={setPhotoZone} disabled={!editable} />
      <DraggableZone label="Name" color="#fbbf24" zone={template.nameZone} containerW={W} containerH={H} onChange={setNameZone} disabled={!editable} />
      <DraggableZone label="Msg" color="#2dd4bf" zone={template.messageZone} containerW={W} containerH={H} onChange={setMessageZone} disabled={!editable} />
    </div>
  );
}

function DraggableZone({
  label,
  color,
  zone,
  containerW,
  containerH,
  onChange,
  disabled,
}: {
  label: string;
  color: string;
  zone: Zone;
  containerW: number;
  containerH: number;
  onChange: (z: Zone) => void;
  disabled?: boolean;
}) {
  const startDrag = (e: React.PointerEvent, mode: "move" | "resize") => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...zone };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / containerW;
      const dy = (ev.clientY - startY) / containerH;
      if (mode === "move") {
        onChange({
          ...start,
          x: Math.max(0, Math.min(1 - start.w, start.x + dx)),
          y: Math.max(0, Math.min(1 - start.h, start.y + dy)),
        });
      } else {
        onChange({
          ...start,
          w: Math.max(0.05, Math.min(1 - start.x, start.w + dx)),
          h: Math.max(0.03, Math.min(1 - start.y, start.h + dy)),
        });
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      onPointerDown={(e) => startDrag(e, "move")}
      style={{
        position: "absolute",
        left: zone.x * containerW,
        top: zone.y * containerH,
        width: zone.w * containerW,
        height: zone.h * containerH,
        border: `2px solid ${color}`,
        background: `${color}22`,
        borderRadius: 8,
        cursor: disabled ? "default" : "move",
        touchAction: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -10,
          left: 4,
          background: color,
          color: "#0b0617",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 6,
        }}
      >
        {label}
      </span>
      {!disabled && (
        <div
          onPointerDown={(e) => startDrag(e, "resize")}
          style={{
            position: "absolute",
            right: -6,
            bottom: -6,
            width: 14,
            height: 14,
            background: color,
            borderRadius: 4,
            cursor: "nwse-resize",
            touchAction: "none",
          }}
        />
      )}
    </div>
  );
}
