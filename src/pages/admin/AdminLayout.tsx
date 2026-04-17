import { Link, Navigate, NavLink, Outlet } from "react-router-dom";
import { LayoutTemplate, LogOut } from "lucide-react";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  if (!storage.isAdminLoggedIn()) return <Navigate to="/admin" replace />;

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
        </nav>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            storage.logoutAdmin();
            window.location.href = "/admin";
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
