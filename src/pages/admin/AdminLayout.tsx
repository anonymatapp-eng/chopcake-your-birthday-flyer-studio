import { Link, Outlet } from "react-router-dom";
import { LayoutTemplate, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border/60 bg-card-elevated p-4 hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">🎂</div>
          <div>
            <div className="font-display font-bold leading-none">ChopCake</div>
            <div className="text-[10px] text-muted-foreground">Admin</div>
          </div>
        </Link>
        <nav className="space-y-1 flex-1">
          <NavLink
            to="/admin/templates"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`
            }
          >
            <LayoutTemplate className="h-4 w-4" /> Templates
          </NavLink>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Back to app
          </Link>
        </nav>
        <div className="space-y-2">
          <div className="px-3 text-[10px] text-muted-foreground truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-12 bg-card-elevated border-b border-border/60 flex items-center justify-between px-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center text-sm">🎂</div>
          <span className="font-display font-bold text-sm">Admin</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main className="flex-1 min-w-0 pt-12 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
