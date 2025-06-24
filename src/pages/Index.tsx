
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import DateDisplay from "@/components/DateDisplay";
import NavigationButtons from "@/components/NavigationButtons";
import MainTabs from "@/components/MainTabs";
import EventsButton from "@/components/EventsButton";
import { Playground } from "@/types/playground";
import { useSupabaseUser } from "@/contexts/SupabaseUserContext";
import { usePlaygrounds } from "@/hooks/usePlaygrounds";
import { useAudioEffects } from "@/hooks/useAudioEffects";

const Index = () => {
  const { toast } = useToast();
  const { isLoggedIn, nickname } = useSupabaseUser();
  const { playgrounds, checkIn, checkOut, hasUserCheckedIn, checkInRecords, updatePlayground } = usePlaygrounds();
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  
  const { scrollToTop, playSoundEffect } = useAudioEffects();

  useEffect(() => {
    console.log("PLAYGROUND DEBUG - Numero di playgrounds caricati:", playgrounds.length);
    console.log("PLAYGROUND DEBUG - Lista completa playgrounds:", playgrounds.map(p => ({ id: p.id, name: p.name })));
  }, [playgrounds]);
  
  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
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
      
      if (selectedPlayground?.id === playgroundId) {
        setSelectedPlayground(updated);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="neptune-background"></div>
      
      <Header />
      
      <main className="container mx-auto p-2 md:p-4 flex-1 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-2 md:gap-4">
          <DateDisplay />
          <NavigationButtons onScrollToTop={scrollToTop} playSoundEffect={playSoundEffect} />
        </div>

        <EventsButton />
        
        <MainTabs
          playgrounds={playgrounds}
          selectedPlayground={selectedPlayground}
          onSelectPlayground={handleSelectPlayground}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          hasUserCheckedIn={hasUserCheckedIn}
          checkInRecords={checkInRecords}
          onRatingUpdate={handleRatingUpdate}
          playSoundEffect={playSoundEffect}
          scrollToTop={scrollToTop}
        />
      </main>
      
      <footer className="arcade-footer mt-2 md:mt-4">
        <div className="container mx-auto px-2 md:px-4 text-center py-2 md:py-4">
          <p className="font-press-start text-xs">
            PLAYGROUND JAM BOLOGNA &copy; 2025
          </p>
          <div className="mt-2" style={{
            color: '#00ffff',
            fontSize: '8px',
            fontFamily: 'Press Start 2P, monospace',
            textShadow: '1px 1px 0px #000'
          }}>
            CONTATTI: playgroundjam21@gmail.com
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
