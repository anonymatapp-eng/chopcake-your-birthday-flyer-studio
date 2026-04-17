import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

function FullLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <FullLoader />;
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, role, loading, roleLoading } = useAuth();
  const loc = useLocation();
  if (loading || roleLoading) return <FullLoader />;
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="font-display text-2xl font-bold">Admin only</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your account doesn't have admin access. The first user to sign up becomes the admin automatically.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
