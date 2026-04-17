import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ADMIN_PASSWORD, storage } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(true);
  const [done, setDone] = useState(storage.isAdminLoggedIn());

  if (done) return <Navigate to="/admin/templates" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      storage.loginAdmin(remember);
      setDone(true);
    } else {
      toast({ title: "Wrong password", description: "Hint: chopcake2025", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm p-6 bg-card-elevated border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</span>
        </div>
        <h1 className="font-display text-2xl font-bold">ChopCake admin</h1>
        <p className="text-sm text-muted-foreground mb-4">Sign in to manage templates.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Password</Label>
            <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" autoFocus />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} /> Remember me
          </label>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground">Sign in</Button>
        </form>
      </Card>
    </div>
  );
}
