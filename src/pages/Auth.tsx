import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    return <Navigate to={params.get("next") ?? "/"} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } =
      tab === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, displayName.trim() || email.split("@")[0]);
    setBusy(false);
    if (error) {
      toast({ title: tab === "signin" ? "Sign-in failed" : "Sign-up failed", description: error, variant: "destructive" });
      return;
    }
    if (tab === "signup") {
      toast({ title: "Welcome to ChopCake! 🎉", description: "You're signed in." });
    }
    navigate(params.get("next") ?? "/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-20" />
      <Card className="w-full max-w-md p-6 bg-card-elevated border-border/60 relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-lg shadow-glow">🎂</div>
          <div>
            <div className="font-display text-xl font-bold leading-none">ChopCake</div>
            <div className="text-[11px] text-muted-foreground">Make every birthday count</div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="mt-5">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <form onSubmit={submit} className="space-y-3 mt-4">
            <TabsContent value="signup" className="m-0">
              <div className="space-y-3">
                <div>
                  <Label>Display name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Alex" />
                </div>
              </div>
            </TabsContent>

            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={tab === "signin" ? "current-password" : "new-password"} />
            </div>

            <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground rounded-full font-semibold">
              <Sparkles className="h-4 w-4" /> {busy ? "Please wait…" : tab === "signin" ? "Sign in" : "Create account"}
            </Button>
            {tab === "signup" && (
              <p className="text-[11px] text-muted-foreground text-center">
                The first account becomes the admin automatically.
              </p>
            )}
          </form>
        </Tabs>
      </Card>
    </div>
  );
}
