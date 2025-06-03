
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import Logo from "@/components/Logo";
import { Playground } from "@/types/playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { usePlaygrounds } from "@/hooks/usePlaygrounds";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, nickname, logout } = useUser();
  const { playgrounds, checkIn, checkOut, hasUserCheckedIn, checkInRecords } = usePlaygrounds();
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  
  // Format current date
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });

  // Auto-logout after 24 hours
  useEffect(() => {
    if (isLoggedIn) {
      const loginTime = localStorage.getItem("userLoginTime");
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (now - loginTimestamp > twentyFourHours) {
          logout();
          toast({
            title: "Sessione scaduta",
            description: "Sei stato disconnesso automaticamente dopo 24 ore",
            variant: "destructive"
          });
        } else {
          // Set a timeout for the remaining time
          const remainingTime = twentyFourHours - (now - loginTimestamp);
          const timeoutId = setTimeout(() => {
            logout();
            toast({
              title: "Sessione scaduta",
              description: "Sei stato disconnesso automaticamente dopo 24 ore",
              variant: "destructive"
            });
          }, remainingTime);
          
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [isLoggedIn, logout, toast]);

  useEffect(() => {
    console.log("Playgrounds caricati:", playgrounds);
  }, [playgrounds]);
  
  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const handleCheckIn = (playgroundId: string, userNickname: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-in",
        variant: "destructive"
      });
      return false;
    }
    
    return checkIn(playgroundId, userNickname, userNickname);
  };

  const handleCheckOut = (playgroundId: string, userNickname: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-out",
        variant: "destructive"
      });
      return false;
    }
    
    return checkOut(playgroundId, userNickname);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <Logo />
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-yellow-400 font-press-start text-xs">
            {currentDate}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                playSoundEffect('click');
                navigate('/stats');
              }}
              className="pixel-button text-xs flex items-center gap-2 bg-blue-600"
            >
              <BarChart size={16} />
              <span className="hidden md:inline">Statistiche</span>
              <span className="inline md:hidden">Stats</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger 
              value="map" 
              className="font-press-start text-xs"
              onClick={() => playSoundEffect('tab')}
            >
              <span className="hidden md:inline">Lista Bologna</span>
              <span className="inline md:hidden">Bologna</span>
            </TabsTrigger>
            <TabsTrigger 
              value="italia" 
              className="font-press-start text-xs"
              onClick={() => playSoundEffect('tab')}
            >
              Lista Italia
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="font-press-start text-xs"
              onClick={() => playSoundEffect('tab')}
            >
              <CalendarDays size={16} className="mr-1" />
              <span className="hidden md:inline">Eventi</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md">
              <MapView 
                playgrounds={playgrounds} 
                selectedPlayground={selectedPlayground}
                onSelectPlayground={handleSelectPlayground} 
              />
            </div>
            
            {selectedPlayground && (
              <PlaygroundDetail 
                playground={selectedPlayground} 
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                hasUserCheckedIn={hasUserCheckedIn}
                checkInRecords={checkInRecords}
              />
            )}
          </TabsContent>
          
          <TabsContent value="italia" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md h-64 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="font-press-start text-lg text-red-600">LISTA ITALIA</h2>
                <p className="font-press-start text-xs text-yellow-400 max-w-md">
                  A breve altri playground in altre città italiane
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md h-64 flex flex-col items-center justify-center">
              <p className="font-press-start text-xs text-red-600 mb-4">
                {isLoggedIn ? 'Eventi disponibili presto' : 'Eventi disponibili dopo il login'}
              </p>
              {!isLoggedIn && (
                <Button 
                  className="mt-4 pixel-button"
                  onClick={() => navigate('/login')}
                >
                  Accedi ora
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-black bg-opacity-70 backdrop-blur-md border-t-4 border-red-600 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/60">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
