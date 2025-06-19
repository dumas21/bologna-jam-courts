
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import { Playground } from "@/types/playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Home } from "lucide-react";
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
  const { playgrounds, checkIn, checkOut, hasUserCheckedIn, checkInRecords, updatePlayground } = usePlaygrounds();
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  
  // Format current date
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });

  // Play coin sound on load
  useEffect(() => {
    const audio = new Audio('/sounds/coin-insert.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.log('Audio playback error:', err));
  }, []);

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
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - loginTimestamp > twentyFourHours) {
          logout();
          toast({
            title: "SESSIONE SCADUTA",
            description: "Sei stato disconnesso automaticamente dopo 24 ore",
            variant: "destructive"
          });
        } else {
          const remainingTime = twentyFourHours - (now - loginTimestamp);
          const timeoutId = setTimeout(() => {
            logout();
            toast({
              title: "SESSIONE SCADUTA",
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
    console.log("PLAYGROUND DEBUG - Numero di playgrounds caricati:", playgrounds.length);
    console.log("PLAYGROUND DEBUG - Lista completa playgrounds:", playgrounds.map(p => ({ id: p.id, name: p.name })));
  }, [playgrounds]);
  
  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playbook error:', err));
  };

  const handleCheckIn = (playgroundId: string, userNickname: string) => {
    if (!isLoggedIn) {
      toast({
        title: "LOGIN RICHIESTO",
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
        title: "LOGIN RICHIESTO",
        description: "Devi effettuare il login per fare check-out",
        variant: "destructive"
      });
      return false;
    }
    
    return checkOut(playgroundId, userNickname);
  };

  const handleRatingUpdate = (playgroundId: string, newRating: number, newRatingCount: number) => {
    const updatedPlayground = playgrounds.find(p => p.id === playgroundId);
    if (updatedPlayground) {
      const updated = {
        ...updatedPlayground,
        rating: newRating,
        ratingCount: newRatingCount
      };
      updatePlayground(updated);
      
      // Update selected playground if it's the same one
      if (selectedPlayground?.id === playgroundId) {
        setSelectedPlayground(updated);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      {/* CRT Screen Effect */}
      <div className="crt-overlay"></div>
      
      {/* Neptune Background */}
      <div className="neptune-background"></div>
      
      <Header />
      
      <main className="container mx-auto p-2 md:p-4 flex-1 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-2 md:gap-4">
          <div className="text-center md:text-left arcade-date text-xs md:text-sm">
            {currentDate.toUpperCase()}
          </div>
          
          <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
            <Button 
              onClick={scrollToTop}
              className="arcade-button arcade-button-home text-xs px-2 py-2 md:px-4 md:py-3"
            >
              <Home size={14} />
              <span className="hidden sm:inline ml-1">HOME</span>
            </Button>
            
            <Button 
              onClick={() => {
                playSoundEffect('click');
                navigate('/stats');
              }}
              className="arcade-button arcade-button-stats text-xs px-2 py-2 md:px-4 md:py-3"
            >
              <BarChart size={14} />
              <span className="hidden sm:inline ml-1">STATS</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="map" className="w-full arcade-main-tabs">
          <TabsList className="w-full grid grid-cols-2 mb-2 md:mb-4 arcade-main-tab-list h-auto">
            <TabsTrigger 
              value="map" 
              className="text-xs md:text-sm arcade-main-tab py-3 px-2"
              onClick={() => playSoundEffect('tab')}
            >
              <span className="hidden sm:inline">BOLOGNA PLAYGROUNDS</span>
              <span className="inline sm:hidden">BOLOGNA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="italia" 
              className="text-xs md:text-sm arcade-main-tab py-3 px-2"
              onClick={() => playSoundEffect('tab')}
            >
              <span className="hidden sm:inline">LISTA ITALIA</span>
              <span className="inline sm:hidden">ITALIA</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="arcade-fade-in mt-2">
            <div className="arcade-section p-2 md:p-4">
              <MapView 
                playgrounds={playgrounds} 
                selectedPlayground={selectedPlayground}
                onSelectPlayground={handleSelectPlayground} 
              />
            </div>
            
            {selectedPlayground && (
              <div className="mt-2 md:mt-4">
                <PlaygroundDetail 
                  playground={selectedPlayground} 
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  hasUserCheckedIn={hasUserCheckedIn}
                  checkInRecords={checkInRecords}
                  onRatingUpdate={handleRatingUpdate}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="italia" className="arcade-fade-in mt-2">
            <div className="arcade-section h-48 md:h-64 flex flex-col items-center justify-center p-4">
              <div className="text-center space-y-2 md:space-y-4">
                <h2 className="text-base md:text-xl arcade-heading">LISTA ITALIA</h2>
                <p className="text-xs md:text-base max-w-md arcade-text">
                  A BREVE ALTRI PLAYGROUND IN ALTRE CITTÀ ITALIANE
                </p>
                <div className="arcade-mini-leaderboard">
                  <h3 className="text-sm md:text-lg mb-2">TOP CITIES COMING SOON:</h3>
                  <div className="space-y-1 text-xs md:text-sm">
                    <div>1. MILANO - COMING SOON</div>
                    <div>2. ROMA - COMING SOON</div>
                    <div>3. NAPOLI - COMING SOON</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="arcade-footer mt-2 md:mt-4">
        <div className="container mx-auto px-2 md:px-4 text-center py-2 md:py-4">
          <p className="font-press-start text-xs">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - MATTEO BERGAMI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
