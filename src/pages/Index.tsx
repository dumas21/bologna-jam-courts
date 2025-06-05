
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import Logo from "@/components/Logo";
import ShootTheHoop from "@/components/ShootTheHoop";
import { Playground } from "@/types/playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, BarChart, Home } from "lucide-react";
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

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
    <div className="min-h-screen flex flex-col bologna-theme">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <Logo />
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="bologna-date-display text-center md:text-left">
            {currentDate}
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              onClick={scrollToTop}
              className="bologna-button-home text-sm flex items-center gap-2"
            >
              <Home size={16} />
              <span className="hidden md:inline">Home</span>
            </Button>
            
            <Button 
              onClick={() => {
                playSoundEffect('click');
                navigate('/stats');
              }}
              className="bologna-button-stats text-sm flex items-center gap-2"
            >
              <BarChart size={16} />
              <span className="hidden md:inline">Statistiche</span>
              <span className="inline md:hidden">Stats</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4 bologna-tabs">
            <TabsTrigger 
              value="map" 
              className="bologna-tab text-sm"
              onClick={() => playSoundEffect('tab')}
            >
              <span className="hidden md:inline">Lista Bologna</span>
              <span className="inline md:hidden">Bologna</span>
            </TabsTrigger>
            <TabsTrigger 
              value="italia" 
              className="bologna-tab text-sm"
              onClick={() => playSoundEffect('tab')}
            >
              Lista Italia
            </TabsTrigger>
            <TabsTrigger 
              value="game" 
              className="bologna-tab text-sm"
              onClick={() => playSoundEffect('tab')}
            >
              🏀 Gioco
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="bologna-tab text-sm"
              onClick={() => playSoundEffect('tab')}
            >
              <CalendarDays size={16} className="mr-1" />
              <span className="hidden md:inline">Eventi</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="animate-pixel-fade-in">
            <div className="bologna-card">
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
            <div className="bologna-card h-64 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="bologna-heading text-xl">LISTA ITALIA</h2>
                <p className="bologna-text text-base max-w-md">
                  A breve altri playground in altre città italiane
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="game" className="animate-pixel-fade-in">
            <div className="bologna-card">
              <ShootTheHoop />
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="animate-pixel-fade-in">
            <div className="bologna-card h-64 flex flex-col items-center justify-center">
              <p className="bologna-text text-base mb-4">
                {isLoggedIn ? 'Eventi disponibili presto' : 'Eventi disponibili dopo il login'}
              </p>
              {!isLoggedIn && (
                <Button 
                  className="mt-4 bologna-button-primary"
                  onClick={() => navigate('/login')}
                >
                  Accedi ora
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bologna-footer">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/80">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
