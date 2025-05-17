
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckInRecord, RegisteredUser, usePlaygrounds } from "@/hooks/usePlaygrounds";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, Shield, BarChart, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const Admin = () => {
  const { toast } = useToast();
  const { isLoggedIn, username, isAdmin } = useUser();
  const navigate = useNavigate();
  const { 
    getRegisteredUsers,
    getTodayCheckins,
    resetAttendanceCounts,
    resetDailyCounts 
  } = usePlaygrounds();
  
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Admin password per questa demo
  const ADMIN_PASSWORD = "admin123"; // In un'app reale, questo sarebbe gestito in modo sicuro
  
  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Accesso negato",
        description: "Devi effettuare il login per accedere a questa pagina",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [isLoggedIn, navigate, toast]);
  
  useEffect(() => {
    if (isAuthenticated) {
      // Carica i dati solo se autenticato
      setRegisteredUsers(getRegisteredUsers());
      setCheckInRecords(getTodayCheckins());
    }
  }, [isAuthenticated, getRegisteredUsers, getTodayCheckins]);
  
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Accesso amministratore",
        description: "Hai effettuato l'accesso come amministratore",
      });
    } else {
      toast({
        title: "Password errata",
        description: "La password amministratore non è corretta",
        variant: "destructive"
      });
    }
  };
  
  const handleResetAttendance = () => {
    if (window.confirm("Sei sicuro di voler azzerare tutti i conteggi delle presenze? Questa operazione non può essere annullata.")) {
      resetAttendanceCounts();
      toast({
        title: "Conteggi azzerati",
        description: "Tutti i conteggi delle presenze sono stati reimpostati a zero",
      });
    }
  };
  
  const handleResetDaily = () => {
    if (window.confirm("Sei sicuro di voler reimpostare i conteggi giornalieri? Tutti gli utenti verranno disconnessi.")) {
      resetDailyCounts();
      // Aggiorna i dati dopo il reset
      setCheckInRecords([]);
    }
  };
  
  if (!isLoggedIn) {
    return null; // L'utente verrà reindirizzato dal useEffect
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="container mx-auto p-4 flex-1 flex flex-col items-center justify-center">
          <Logo />
          
          <div className="max-w-md w-full mt-8">
            <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
              <h2 className="font-press-start text-xs md:text-sm text-center py-2">
                ACCESSO AMMINISTRATORE
              </h2>
            </div>
            
            <div className="pixel-card p-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-press-start text-xs text-jam-orange">
                    Password Amministratore
                  </label>
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-opacity-50"
                    placeholder="Inserisci la password admin"
                  />
                </div>
                
                <Button 
                  onClick={handleAdminLogin}
                  className="pixel-button w-full"
                >
                  ACCEDI
                </Button>
              </div>
              
              <p className="mt-6 text-center text-xs text-white/60">
                Per questa demo, usa la password: "admin123"
              </p>
            </div>
          </div>
        </main>
        
        <footer className="bg-black bg-opacity-80 border-t-4 border-jam-purple py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="font-press-start text-xs text-white/60">
              PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
            </p>
          </div>
        </footer>
      </div>
    );
  }
  
  // Admin dashboard (autenticato)
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <Logo />
        
        <div className="flex justify-between items-center mb-6">
          <div className="text-yellow-400 font-press-start text-xs">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: it })}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/")}
              className="pixel-button text-xs flex items-center gap-2 bg-blue-600"
            >
              Torna alla Home
            </Button>
          </div>
        </div>
        
        <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md mb-6">
          <div className="flex justify-between items-center">
            <h2 className="font-press-start text-red-600 text-sm">
              Pannello Amministratore
            </h2>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleResetDaily}
                className="pixel-button text-xs bg-orange-600"
              >
                <RefreshCcw size={16} className="mr-1" />
                Reset Giornaliero
              </Button>
              
              <Button 
                onClick={handleResetAttendance}
                className="pixel-button text-xs bg-red-600"
              >
                <RefreshCcw size={16} className="mr-1" />
                Reset Totale
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="checkins">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="checkins" className="font-press-start text-xs">
              <Mail size={16} className="mr-1" />
              Check-in Oggi
            </TabsTrigger>
            <TabsTrigger value="users" className="font-press-start text-xs">
              <Users size={16} className="mr-1" />
              Utenti Registrati
            </TabsTrigger>
            <TabsTrigger value="stats" className="font-press-start text-xs">
              <BarChart size={16} className="mr-1" />
              Statistiche
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="checkins">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md">
              <h3 className="font-press-start text-xs text-red-600 mb-4">
                Check-in di oggi ({checkInRecords.length})
              </h3>
              
              {checkInRecords.length > 0 ? (
                <div className="bg-white rounded-md p-4 text-black">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-semibold p-2">Email</th>
                        <th className="text-left text-xs font-semibold p-2">Playground</th>
                        <th className="text-left text-xs font-semibold p-2">Ora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkInRecords.map((record, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="p-2 text-xs">{record.email}</td>
                          <td className="p-2 text-xs">{record.playgroundId}</td>
                          <td className="p-2 text-xs">
                            {format(new Date(record.timestamp), "HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-white/70 text-sm">Nessun check-in effettuato oggi</p>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={() => {
                    // Esportazione in CSV
                    if (checkInRecords.length === 0) {
                      toast({
                        title: "Nessun dato da esportare",
                        description: "Non ci sono check-in da esportare",
                      });
                      return;
                    }
                    
                    const headers = "Email,Playground,Timestamp\n";
                    const csvData = checkInRecords.map(record => 
                      `${record.email},${record.playgroundId},${format(new Date(record.timestamp), "dd/MM/yyyy HH:mm")}`
                    ).join('\n');
                    
                    const blob = new Blob([headers + csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', `checkins_${format(new Date(), "yyyyMMdd")}.csv`);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="pixel-button bg-blue-600 text-xs"
                  disabled={checkInRecords.length === 0}
                >
                  Esporta CSV
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md">
              <h3 className="font-press-start text-xs text-red-600 mb-4">
                Utenti Registrati ({registeredUsers.length})
              </h3>
              
              {registeredUsers.length > 0 ? (
                <div className="bg-white rounded-md p-4 text-black">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-semibold p-2">Email</th>
                        <th className="text-left text-xs font-semibold p-2">Data Registrazione</th>
                        <th className="text-left text-xs font-semibold p-2">Ruolo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredUsers.map((user, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="p-2 text-xs">{user.email}</td>
                          <td className="p-2 text-xs">
                            {format(new Date(user.registrationDate), "dd/MM/yyyy HH:mm")}
                          </td>
                          <td className="p-2 text-xs">
                            {user.isAdmin ? (
                              <span className="flex items-center text-green-600">
                                <Shield size={12} className="mr-1" />
                                Admin
                              </span>
                            ) : (
                              "Utente"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-white/70 text-sm">Nessun utente registrato</p>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={() => {
                    // Esportazione in CSV
                    if (registeredUsers.length === 0) {
                      toast({
                        title: "Nessun dato da esportare",
                        description: "Non ci sono utenti da esportare",
                      });
                      return;
                    }
                    
                    const headers = "Email,DataRegistrazione,Ruolo\n";
                    const csvData = registeredUsers.map(user => 
                      `${user.email},${format(new Date(user.registrationDate), "dd/MM/yyyy HH:mm")},${user.isAdmin ? "Admin" : "Utente"}`
                    ).join('\n');
                    
                    const blob = new Blob([headers + csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', `users_${format(new Date(), "yyyyMMdd")}.csv`);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="pixel-button bg-blue-600 text-xs"
                  disabled={registeredUsers.length === 0}
                >
                  Esporta CSV
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md">
              <h3 className="font-press-start text-xs text-red-600 mb-4">
                Statistiche Utenti
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black bg-opacity-50 p-4 rounded-md border border-jam-purple">
                  <h4 className="font-press-start text-xs text-jam-orange mb-2">Utenti Registrati</h4>
                  <div className="text-3xl font-press-start text-white">{registeredUsers.length}</div>
                  <div className="text-xs text-white/70 mt-2">Totale utenti nel sistema</div>
                </div>
                
                <div className="bg-black bg-opacity-50 p-4 rounded-md border border-jam-purple">
                  <h4 className="font-press-start text-xs text-jam-orange mb-2">Check-in Oggi</h4>
                  <div className="text-3xl font-press-start text-white">{checkInRecords.length}</div>
                  <div className="text-xs text-white/70 mt-2">Numero di check-in odierni</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-press-start text-xs text-red-600 mb-2">
                  Totale Playground
                </h4>
                <div className="text-3xl font-press-start text-white">16</div>
                <div className="text-xs text-white/70 mt-2">Campi da basket disponibili a Bologna</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-black bg-opacity-80 border-t-4 border-jam-purple py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/60">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
