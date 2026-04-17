import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAdmin, RequireAuth } from "@/components/RequireAuth";
import AppShell from "@/components/AppShell";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import Birthdays from "@/pages/Birthdays";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import AdminLayout from "@/pages/admin/AdminLayout";
import TemplatesAdmin from "@/pages/admin/TemplatesAdmin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/birthdays" element={<Birthdays />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route
              path="/admin/*"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<Navigate to="templates" replace />} />
              <Route path="templates" element={<TemplatesAdmin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
