
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, User, Calendar, Shield } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface RegisteredUser {
  id: string;
  email: string;
  nickname: string;
  registrationDate: string;
  lastLogin?: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoggedIn } = useUser();
  const [users, setUsers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    // Redirect if not admin
    if (!isLoggedIn || !isAdmin) {
      navigate("/");
      return;
    }

    // Load registered users from localStorage
    loadRegisteredUsers();
  }, [isLoggedIn, isAdmin, navigate]);

  const loadRegisteredUsers = () => {
    try {
      const savedUsers = localStorage.getItem("registeredUsers");
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers.sort((a: RegisteredUser, b: RegisteredUser) => 
          new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
        ));
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const clearAllUsers = () => {
    if (window.confirm("Sei sicuro di voler cancellare tutti gli utenti registrati?")) {
      localStorage.removeItem("registeredUsers");
      localStorage.removeItem("registeredEmails");
      setUsers([]);
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Email,Nickname,Data Registrazione,Ultimo Login\n" +
      users.map(user => 
        `"${user.email}","${user.nickname}","${user.registrationDate}","${user.lastLogin || 'N/A'}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `utenti_playground_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="crt-overlay"></div>
      <div className="neptune-background"></div>
      
      <Header />
      
      <main className="container mx-auto p-4 flex-1 relative z-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <Button
              onClick={() => navigate("/")}
              className="arcade-button arcade-button-secondary"
            >
              <ArrowLeft size={16} className="mr-2" />
              TORNA AI PLAYGROUND
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={exportUsers}
                className="arcade-button arcade-button-primary"
                disabled={users.length === 0}
              >
                <Mail size={16} className="mr-2" />
                ESPORTA CSV
              </Button>
              
              <Button
                onClick={clearAllUsers}
                className="arcade-button arcade-button-danger"
                disabled={users.length === 0}
              >
                CANCELLA TUTTI
              </Button>
            </div>
          </div>

          <Card className="arcade-card mb-6">
            <CardHeader>
              <CardTitle className="arcade-title flex items-center gap-2">
                <Shield className="text-yellow-400" size={24} />
                PANNELLO ADMIN - UTENTI REGISTRATI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-900/50 p-4 rounded-lg border-2 border-blue-400">
                  <div className="text-2xl font-bold text-blue-400">{users.length}</div>
                  <div className="text-sm text-blue-300">Utenti Totali</div>
                </div>
                
                <div className="bg-green-900/50 p-4 rounded-lg border-2 border-green-400">
                  <div className="text-2xl font-bold text-green-400">
                    {users.filter(u => u.lastLogin && 
                      new Date(u.lastLogin).getTime() > Date.now() - 24 * 60 * 60 * 1000
                    ).length}
                  </div>
                  <div className="text-sm text-green-300">Attivi Oggi</div>
                </div>
                
                <div className="bg-purple-900/50 p-4 rounded-lg border-2 border-purple-400">
                  <div className="text-2xl font-bold text-purple-400">
                    {users.filter(u => 
                      new Date(u.registrationDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).length}
                  </div>
                  <div className="text-sm text-purple-300">Nuovi (7gg)</div>
                </div>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user, index) => (
                      <div 
                        key={user.id}
                        className="bg-black/60 p-4 rounded-lg border-2 border-orange-500/50 hover:border-orange-500 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                                <User size={16} />
                                {user.nickname}
                              </div>
                              <div className="flex items-center gap-2 text-white/80 text-sm">
                                <Mail size={14} />
                                {user.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-yellow-400 text-sm font-semibold">REGISTRAZIONE</div>
                            <div className="text-white/80 text-xs flex items-center justify-center gap-1">
                              <Calendar size={12} />
                              {format(new Date(user.registrationDate), "dd/MM/yyyy HH:mm", { locale: it })}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-green-400 text-sm font-semibold">ULTIMO LOGIN</div>
                            <div className="text-white/80 text-xs">
                              {user.lastLogin ? 
                                format(new Date(user.lastLogin), "dd/MM/yyyy HH:mm", { locale: it }) : 
                                "Mai"
                              }
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-white/60">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Mail size={64} className="mx-auto text-gray-500 mb-4" />
                    <div className="text-xl text-gray-400 mb-2">Nessun utente registrato</div>
                    <div className="text-sm text-gray-500">Gli utenti appariranno qui dopo il login</div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
