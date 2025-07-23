
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import DateDisplay from "@/components/DateDisplay";
import NavigationButtons from "@/components/NavigationButtons";
import MainTabs from "@/components/MainTabs";
import EventsButton from "@/components/EventsButton";
import { Playground } from "@/types/playground";
import { usePlaygrounds } from "@/hooks/usePlaygrounds";
import { useAudioEffects } from "@/hooks/useAudioEffects";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { toast } = useToast();
  const { isAuthenticated, profile, isLoading } = useAuth();
  const nickname = profile?.username || profile?.nickname || 'Anonymous';
  const { playgrounds, checkIn, checkOut, hasUserCheckedIn, checkInRecords, updatePlayground } = usePlaygrounds();
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  
  const { scrollToTop, playSoundEffect } = useAudioEffects();

  useEffect(() => {
    console.log("PLAYGROUND DEBUG - Numero di playgrounds caricati:", playgrounds.length);
    console.log("PLAYGROUND DEBUG - Lista completa playgrounds:", playgrounds.map(p => ({ id: p.id, name: p.name })));
    console.log("AUTH DEBUG - Utente autenticato:", isAuthenticated, "Nickname:", nickname);
  }, [playgrounds, isAuthenticated, nickname]);
  
  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const handleCheckIn = (playgroundId: string, userNickname: string) => {
    // Usa il nickname del profilo se l'utente è autenticato
    const finalNickname = isAuthenticated ? nickname : userNickname;
    return checkIn(playgroundId, finalNickname, finalNickname);
  };

  const handleCheckOut = (playgroundId: string, userNickname: string) => {
    // Usa il nickname del profilo se l'utente è autenticato
    const finalNickname = isAuthenticated ? nickname : userNickname;
    return checkOut(playgroundId, finalNickname);
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

  // Mostra un loader durante il caricamento dell'autenticazione
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
        
        {/* Test Auth Link */}
        <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }}>
          <a 
            href="/auth-simple" 
            style={{ 
              background: '#007bff', 
              color: 'white', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              textDecoration: 'none',
              fontSize: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            🔐 Test Auth
          </a>
        </div>
        
        {/* Mostra un messaggio di benvenuto se l'utente è autenticato */}
        {isAuthenticated && profile && (
          <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg">
            <p className="text-green-200 text-sm nike-text">
              BENVENUTO/A {nickname.toUpperCase()}! Ora puoi scrivere nei playground come utente registrato.
            </p>
          </div>
        )}
        
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
