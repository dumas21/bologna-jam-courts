
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckInRecord, usePlaygrounds } from "@/hooks/usePlaygrounds";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, BarChart, Calendar, Search, Sun, Cloud, CloudRain } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { WeatherData } from "@/types/playgroundTypes";

const Admin = () => {
  const { toast } = useToast();
  const { isLoggedIn, nickname, isAdmin } = useUser();
  const navigate = useNavigate();
  const { 
    getTodayCheckins,
    resetAttendanceCounts,
    resetDailyCounts 
  } = usePlaygrounds();
  
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData>({
    condition: "Soleggiato",
    temperature: 24,
    humidity: 60,
    icon: "sun"
  });
  
  // Admin password
  const ADMIN_PASSWORD = "Admin2025!";
  
  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Accesso negato",
        description: "Devi effettuare il login per accedere a questa pagina",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    // Automatically authenticate if the user is bergami.matteo@gmail.com
    if (nickname === "matteo") {
      setIsAuthenticated(true);
    }
  }, [isLoggedIn, navigate, toast, nickname]);
  
  useEffect(() => {
    if (isAuthenticated) {
      // Carica i dati solo se autenticato
      setCheckInRecords(getTodayCheckins());
    }
  }, [isAuthenticated, getTodayCheckins]);
  
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      
      // Play admin sound
      const audio = new Audio('/sounds/admin.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      toast({
        title: "Accesso amministratore",
        description: "Hai effettuato l'accesso come amministratore",
      });
    } else {
      // Play error sound
      const audio = new Audio('/sounds/error.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      toast({
        title: "Password errata",
        description: "La password amministratore non è corretta",
        variant: "destructive"
      });
    }
  };
  
  const playSound = (soundName: string) => {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const handleResetStatistics = () => {
    if (resetAttendanceCounts()) {
      playSound("reset");
      toast({
        title: "Statistiche azzerate",
        description: "Tutte le statistiche dei playground sono state azzerate",
      });
    }
  };
  
  // Filtra gli utenti in base al termine di ricerca
  const filteredRecords = checkInRecords
    .filter(record => 
      record.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.nickname.localeCompare(b.nickname)); // Ordine alfabetico
  
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
              <h2 className="font-press-start text-xs md:text-sm text-center py-2 font-bold">
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
                Per effettuare l'accesso, usa la password dell'amministratore
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
              onClick={handleResetStatistics}
              className="pixel-button text-xs flex items-center gap-2 bg-red-600"
            >
              Azzera Statistiche
            </Button>
            <Button 
              onClick={() => {
                playSound('click');
                navigate("/");
              }}
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
          </div>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="w-full mb-4">
            <TabsTrigger 
              value="users" 
              className="font-press-start text-xs"
              onClick={() => playSound('tab')}
            >
              <Users size={16} className="mr-1" />
              Check-in Oggi
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="font-press-start text-xs"
              onClick={() => playSound('tab')}
            >
              <BarChart size={16} className="mr-1" />
              Statistiche
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="font-press-start text-xs"
              onClick={() => playSound('tab')}
            >
              <Calendar size={16} className="mr-1" />
              Eventi
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-press-start text-xs text-red-600 font-bold">
                  Check-in di Oggi ({filteredRecords.length})
                </h3>
                
                <div className="flex bg-black rounded-md border border-jam-purple overflow-hidden">
                  <Input
                    placeholder="Cerca nickname..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-0 text-white text-xs"
                  />
                  <Search size={16} className="text-jam-purple my-auto mr-2" />
                </div>
              </div>
              
              {filteredRecords.length > 0 ? (
                <div className="bg-white rounded-md p-4 text-black">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-semibold p-2">Nickname</th>
                        <th className="text-left text-xs font-semibold p-2">Playground</th>
                        <th className="text-left text-xs font-semibold p-2">Orario Check-in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="p-2 text-xs">{record.nickname}</td>
                          <td className="p-2 text-xs">{record.playgroundId}</td>
                          <td className="p-2 text-xs">
                            {format(new Date(record.timestamp), "dd/MM/yyyy HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-white/70 text-sm">
                  {searchTerm ? "Nessun check-in corrisponde alla ricerca" : "Nessun check-in oggi"}
                </p>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={() => {
                    playSound('click');
                    // Esportazione in CSV
                    if (filteredRecords.length === 0) {
                      toast({
                        title: "Nessun dato da esportare",
                        description: "Non ci sono check-in da esportare",
                      });
                      return;
                    }
                    
                    const headers = "Nickname,Playground,OrarioCheckIn\n";
                    const csvData = filteredRecords.map(record => 
                      `${record.nickname},${record.playgroundId},${format(new Date(record.timestamp), "dd/MM/yyyy HH:mm")}`
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
                  disabled={filteredRecords.length === 0}
                >
                  Esporta CSV
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md">
              <h3 className="font-press-start text-xs text-red-600 mb-4 font-bold">
                Previsioni Meteo Bologna
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black bg-opacity-50 p-4 rounded-md border border-jam-purple">
                  <h4 className="font-press-start text-xs text-jam-orange mb-2 font-bold">Condizioni Meteo</h4>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 p-3 rounded-full">
                      {weatherData.icon === "sun" && <Sun className="text-yellow-400" size={32} />}
                      {weatherData.icon === "cloud" && <Cloud className="text-white" size={32} />}
                      {weatherData.icon === "rain" && <CloudRain className="text-white" size={32} />}
                    </div>
                    <div>
                      <div className="text-2xl font-press-start text-white">{weatherData.temperature}°C</div>
                      <div className="text-xs text-white/70 mt-1">{weatherData.condition}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black bg-opacity-50 p-4 rounded-md border border-jam-purple">
                  <h4 className="font-press-start text-xs text-jam-orange mb-2 font-bold">Umidità</h4>
                  <div className="text-2xl font-press-start text-white">{weatherData.humidity}%</div>
                  <div className="text-xs text-white/70 mt-1">Umidità relativa dell'aria</div>
                </div>
              </div>
              
              <div className="mt-4 bg-white p-4 rounded-md text-black">
                <h4 className="font-press-start text-sm mb-2">Prossimi Giorni</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { day: "Domani", temp: "25°C", condition: "Soleggiato" },
                    { day: "Dopodomani", temp: "23°C", condition: "Parzialmente nuvoloso" },
                    { day: "Tra 3 giorni", temp: "21°C", condition: "Possibile pioggia" }
                  ].map((forecast, index) => (
                    <div key={index} className="border border-gray-200 p-2 rounded">
                      <div className="font-bold text-sm">{forecast.day}</div>
                      <div className="text-lg">{forecast.temp}</div>
                      <div className="text-xs text-gray-500">{forecast.condition}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md">
              <h3 className="font-press-start text-xs text-red-600 mb-4 font-bold">
                Gestione Eventi
              </h3>
              
              <div className="bg-white rounded-md p-6 text-black">
                <p className="font-bold mb-4">Pianifica e gestisci eventi per i playground di Bologna</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm mb-2">Eventi in programma</h4>
                    <p className="text-sm text-gray-600 italic">Non ci sono eventi programmati al momento.</p>
                    
                    <Button 
                      onClick={() => {
                        playSound('click');
                        toast({
                          title: "Feature in arrivo",
                          description: "La gestione degli eventi sarà disponibile prossimamente",
                        });
                      }}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Calendar size={16} className="mr-2" />
                      Crea nuovo evento
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-sm mb-2">Idee per eventi</h4>
                    <ul className="list-disc pl-5 text-sm space-y-2">
                      <li>Tornei 3vs3</li>
                      <li>Clinic di allenamento</li>
                      <li>Sfide di tiro</li>
                      <li>Eventi per bambini</li>
                      <li>Esibizioni freestyle</li>
                    </ul>
                  </div>
                </div>
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
