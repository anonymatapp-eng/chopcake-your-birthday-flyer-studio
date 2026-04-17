import { NavLink, Outlet } from "react-router-dom";
import { Cake, Compass, Home, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/create", label: "Create", icon: Sparkles },
  { to: "/birthdays", label: "Birthdays", icon: Cake },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar (desktop) */}
      <header className="sticky top-0 z-40 hidden md:block border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-lg shadow-glow">
              🎂
            </div>
            <span className="font-display text-xl font-bold">ChopCake</span>
          </NavLink>
          <nav className="flex items-center gap-1">
            {navItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )
                }
              >
                {it.label}
              </NavLink>
            ))}
          </nav>
          <NavLink
            to="/profile"
            className="h-9 w-9 rounded-full gradient-cool flex items-center justify-center text-sm font-semibold"
          >
            🙂
          </NavLink>
        </div>
      </header>

      {/* Mobile top brand */}
      <header className="md:hidden sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-base">🎂</div>
            <span className="font-display font-bold">ChopCake</span>
          </NavLink>
          <NavLink to="/profile" className="h-8 w-8 rounded-full gradient-cool" />
        </div>
      </header>

      <main className="pb-28 md:pb-12 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-elev-lg">
        <div className="grid grid-cols-5">
          {navItems.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-smooth",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "h-8 w-12 rounded-full flex items-center justify-center transition-spring",
                        isActive && "bg-primary/15",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{it.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
