
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import Logo from "@/components/Logo";
import { Playground } from "@/types/playgroundTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, CalendarDays, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { usePlaygrounds } from "@/hooks/usePlaygrounds";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, username } = useUser();
  const { playgrounds, checkIn, checkOut, hasUserCheckedIn, checkInRecords } = usePlaygrounds();
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  
  // Format current date
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });

  // Log playgrounds per verificare che i dati siano caricati correttamente
  useEffect(() => {
    console.log("Playgrounds caricati:", playgrounds);
  }, [playgrounds]);
  
  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
    // Play sound effect
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const handleCheckIn = (playgroundId: string, userEmail: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-in",
        variant: "destructive"
      });
      return false;
    }
    
    return checkIn(playgroundId, userEmail);
  };

  const handleCheckOut = (playgroundId: string, userEmail: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-out",
        variant: "destructive"
      });
      return false;
    }
    
    return checkOut(playgroundId, userEmail);
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
              <span className="hidden md:inline">Lista</span>
              <span className="inline md:hidden">Lista</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="font-press-start text-xs"
              onClick={() => playSoundEffect('tab')}
            >
              <MessageSquare size={16} className="mr-1" />
              <span className="hidden md:inline">Chat</span>
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
          
          <TabsContent value="chat" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md h-64 flex flex-col items-center justify-center">
              <p className="font-press-start text-xs text-red-600 mb-4">
                {isLoggedIn ? 'Chat disponibile nei singoli playground' : 'Chat disponibile dopo il login'}
              </p>
              <p className="text-xs text-white/70">
                Seleziona un playground dalla mappa e vai alla tab "Chat" per chattare con altri giocatori
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-md h-64 flex items-center justify-center">
              <p className="font-press-start text-xs text-red-600">
                {isLoggedIn ? 'Eventi disponibili presto' : 'Eventi disponibili dopo il login'}
              </p>
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
