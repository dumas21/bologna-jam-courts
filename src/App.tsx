
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseUserProvider } from "./contexts/SupabaseUserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddPlayground from "./pages/AddPlayground";
import Login from "./pages/Login";
import Stats from "./pages/Stats";
import Events from "./pages/Events";
import AdminUsers from "./pages/AdminUsers";
import CreateUsername from "./pages/CreateUsername";
import Chat from "./pages/Chat";
import CookieBanner from "./components/CookieBanner";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SupabaseUserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/add-playground" element={<AddPlayground />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-username" element={<CreateUsername />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/events" element={<Events />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SupabaseUserProvider>
      </QueryClientProvider>
      <CookieBanner />
    </>
  );
}

export default App;
