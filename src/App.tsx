import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/AppShell";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import Birthdays from "@/pages/Birthdays";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import TemplatesAdmin from "@/pages/admin/TemplatesAdmin";
import NotFound from "@/pages/NotFound";
import { ensureSeed } from "@/lib/storage";
import { scheduleReminders } from "@/lib/reminders";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    ensureSeed();
    scheduleReminders();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/birthdays" element={<Birthdays />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<Navigate to="templates" replace />} />
              <Route path="templates" element={<TemplatesAdmin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
