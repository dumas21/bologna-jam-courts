import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, LayoutDashboard, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPlaygrounds from "@/components/admin/AdminPlaygrounds";
import AdminEvents from "@/components/admin/AdminEvents";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        toast.error("Errore verifica permessi");
        setCheckingRole(false);
        return;
      }

      setIsAdmin(data === true);
      setCheckingRole(false);
    };

    if (!isLoading) {
      checkAdminRole();
    }
  }, [user, isLoading]);

  // Loading state
  if (isLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center arcade-container">
        <div className="neptune-background"></div>
        <div className="text-center relative z-10">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="arcade-text">VERIFICA PERMESSI...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center arcade-container">
        <div className="neptune-background"></div>
        <div className="text-center relative z-10">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4 arcade-title">ACCESSO NEGATO</h1>
          <p className="arcade-text mb-6">Devi effettuare il login</p>
          <Button onClick={() => navigate('/auth')} className="arcade-button">
            VAI AL LOGIN
          </Button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center arcade-container">
        <div className="neptune-background"></div>
        <div className="text-center relative z-10">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4 arcade-title">ACCESSO NEGATO</h1>
          <p className="arcade-text mb-6">Non hai i permessi per accedere a questa sezione</p>
          <Button onClick={() => navigate('/')} className="arcade-button">
            TORNA ALLA HOME
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="neptune-background"></div>
      
      <header className="arcade-header relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate('/')} className="arcade-button arcade-button-home">
              <ArrowLeft size={16} />
              <span className="ml-2">TORNA ALLA MAPPA</span>
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold arcade-title flex items-center gap-3">
              <Shield className="text-primary" />
              ADMIN PANEL
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-1 relative z-10">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 arcade-tabs">
            <TabsTrigger value="users" className="arcade-tab flex items-center gap-2">
              <Users size={16} />
              <span className="hidden sm:inline">UTENTI</span>
            </TabsTrigger>
            <TabsTrigger value="playgrounds" className="arcade-tab flex items-center gap-2">
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">PLAYGROUND</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="arcade-tab flex items-center gap-2">
              <Calendar size={16} />
              <span className="hidden sm:inline">EVENTI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="arcade-section p-6">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="playgrounds" className="arcade-section p-6">
            <AdminPlaygrounds />
          </TabsContent>

          <TabsContent value="events" className="arcade-section p-6">
            <AdminEvents />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="arcade-footer mt-4">
        <div className="container mx-auto px-4 text-center py-4">
          <p className="font-press-start text-xs">
            PLAYGROUND JAM BOLOGNA &copy; 2026 - ADMIN PANEL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;