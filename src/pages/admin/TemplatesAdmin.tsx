import { useMemo, useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useTemplates, templateApi } from "@/hooks/useData";
import type { Template } from "@/types";
import TemplateEditor from "./TemplateEditor";
import { toast } from "@/hooks/use-toast";

export default function TemplatesAdmin() {
  const { data: templates, refresh, loading } = useTemplates(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [open, setOpen] = useState(false);
  const sorted = useMemo(() => [...templates].sort((a, b) => b.createdAt - a.createdAt), [templates]);

  const open_ = (t: Template | null) => {
    setEditing(t);
    setOpen(true);
  };

  const dup = async (t: Template) => {
    try {
      const copy: Template = { ...t, id: crypto.randomUUID(), name: `${t.name} (copy)`, createdAt: Date.now(), usageCount: 0 };
      await templateApi.upsert(copy);
      refresh();
      toast({ title: "Duplicated" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const del = async (t: Template) => {
    if (!confirm(`Delete "${t.name}"?`)) return;
    try {
      await templateApi.remove(t.id);
      refresh();
      toast({ title: "Deleted" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const toggleActive = async (t: Template) => {
    await templateApi.upsert({ ...t, active: !t.active });
    refresh();
  };

  return (
    <div className="p-4 md:p-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground">Upload backgrounds and define photo, name, and message zones.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); refresh(); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => open_(null)} className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> New template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-card border-border max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Edit template" : "New template"}</DialogTitle>
            </DialogHeader>
            <TemplateEditor editing={editing} onClose={() => { setOpen(false); refresh(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : sorted.length === 0 ? (
        <Card className="p-10 text-center bg-card-elevated border-dashed">
          <div className="text-4xl mb-2">🎨</div>
          <div className="font-display text-lg font-bold">No templates yet</div>
          <p className="text-sm text-muted-foreground mb-4">Create your first template to get started.</p>
          <Button onClick={() => open_(null)}><Plus className="h-4 w-4" /> New template</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((t) => (
            <Card key={t.id} className="overflow-hidden bg-card-elevated border-border/60">
              <div className="aspect-[9/16] relative">
                <img src={t.background} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.active ? "bg-teal text-teal-foreground" : "bg-muted text-muted-foreground"}`}>
                    {t.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <div className="text-sm font-bold flex items-center gap-1"><span>{t.emoji}</span> {t.name}</div>
                  <div className="text-[10px] opacity-80">{t.category} · {t.usageCount} uses</div>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <Switch checked={t.active} onCheckedChange={() => toggleActive(t)} />
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => open_(t)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => dup(t)} title="Duplicate"><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(t)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
