
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import Logo from "@/components/Logo";
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
    console.log("Playgrounds caricati:", playgrounds);
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
      
      <main className="container mx-auto p-4 flex-1 relative z-10">
        <Logo />
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-center md:text-left arcade-date">
            {currentDate.toUpperCase()}
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              onClick={scrollToTop}
              className="arcade-button arcade-button-home"
            >
              <Home size={16} />
              <span className="hidden md:inline">HOME</span>
            </Button>
            
            <Button 
              onClick={() => {
                playSoundEffect('click');
                navigate('/stats');
              }}
              className="arcade-button arcade-button-stats"
            >
              <BarChart size={16} />
              <span className="hidden md:inline">STATISTICHE</span>
              <span className="inline md:hidden">STATS</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="map" className="w-full arcade-main-tabs">
          <TabsList className="w-full grid grid-cols-3 mb-4 arcade-main-tab-list">
            <TabsTrigger 
              value="map" 
              className="text-sm arcade-main-tab"
              onClick={() => playSoundEffect('tab')}
            >
              <span className="hidden md:inline">BOLOGNA PLAYGROUNDS</span>
              <span className="inline md:hidden">BOLOGNA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="italia" 
              className="text-sm arcade-main-tab"
              onClick={() => playSoundEffect('tab')}
            >
              LISTA ITALIA
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="text-sm arcade-main-tab"
              onClick={() => playSoundEffect('tab')}
            >
              <CalendarDays size={16} className="mr-1" />
              <span className="hidden md:inline">EVENTI</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="arcade-fade-in">
            <div className="arcade-section">
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
                onRatingUpdate={handleRatingUpdate}
              />
            )}
          </TabsContent>
          
          <TabsContent value="italia" className="arcade-fade-in">
            <div className="arcade-section h-64 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-xl arcade-heading">LISTA ITALIA</h2>
                <p className="text-base max-w-md arcade-text">
                  A BREVE ALTRI PLAYGROUND IN ALTRE CITTÀ ITALIANE
                </p>
                <div className="arcade-mini-leaderboard">
                  <h3 className="text-lg mb-2">TOP CITIES COMING SOON:</h3>
                  <div className="space-y-1 text-sm">
                    <div>1. MILANO - COMING SOON</div>
                    <div>2. ROMA - COMING SOON</div>
                    <div>3. NAPOLI - COMING SOON</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="arcade-fade-in">
            <div className="arcade-section h-64 flex flex-col items-center justify-center">
              <p className="text-base mb-4 arcade-text">
                {isLoggedIn ? 'EVENTI DISPONIBILI PRESTO' : 'EVENTI DISPONIBILI DOPO IL LOGIN'}
              </p>
              {!isLoggedIn && (
                <Button 
                  className="mt-4 arcade-button arcade-button-primary"
                  onClick={() => navigate('/login')}
                >
                  ACCEDI ORA
                </Button>
              )}
              {isLoggedIn && (
                <div className="arcade-mini-leaderboard">
                  <h3 className="text-lg mb-2">PROSSIMI EVENTI:</h3>
                  <div className="space-y-1 text-sm">
                    <div>🏀 TORNEO FORTITUDO - 15 GEN</div>
                    <div>🏀 SFIDA VIRTUS - 22 GEN</div>
                    <div>🏀 BOLOGNA JAM FEST - 30 GEN</div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="arcade-footer">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - MATTEO BERGAMI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
