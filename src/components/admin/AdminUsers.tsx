import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Search, User, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Profile {
  id: string;
  nickname: string;
  email: string;
  created_at: string | null;
  last_login: string | null;
  login_count: number | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    
    const [profilesResult, rolesResult] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role')
    ]);

    if (profilesResult.error) {
      toast.error("Errore caricamento profili");
      console.error(profilesResult.error);
    } else {
      setProfiles(profilesResult.data || []);
    }

    if (rolesResult.error) {
      console.error('Roles error:', rolesResult.error);
    } else {
      setRoles(rolesResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUserRole = (userId: string): string => {
    const userRole = roles.find(r => r.user_id === userId);
    return userRole?.role || 'user';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'moderator': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold arcade-heading">GESTIONE UTENTI</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca utente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={fetchData} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Totale utenti: <span className="text-primary font-bold">{profiles.length}</span>
      </div>

      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <div 
            key={profile.id} 
            className="arcade-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{profile.nickname}</span>
                  <Badge className={getRoleBadgeColor(getUserRole(profile.id))}>
                    {getUserRole(profile.id).toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  {profile.email}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {profile.created_at 
                  ? format(new Date(profile.created_at), 'dd MMM yyyy', { locale: it })
                  : 'N/A'
                }
              </div>
              <div className="text-muted-foreground">
                Login: <span className="text-primary">{profile.login_count || 0}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredProfiles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nessun utente trovato
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;