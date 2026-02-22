
import { useState } from "react";
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

  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const handleCheckIn = (playgroundId: string, userNickname: string) => {
    const finalNickname = isAuthenticated ? nickname : userNickname;
    return checkIn(playgroundId, finalNickname, finalNickname);
  };

  const handleCheckOut = (playgroundId: string, userNickname: string) => {
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
      
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 flex-1 relative z-10 max-w-5xl">
        {/* Top bar: date + nav */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <DateDisplay />
          <NavigationButtons onScrollToTop={scrollToTop} playSoundEffect={playSoundEffect} />
        </div>

        {/* Events banner — cleaner */}
        <EventsButton />
        
        {/* Welcome message */}
        {isAuthenticated && profile && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-green-500/40 bg-green-500/10 backdrop-blur-sm">
            <p className="text-green-300 text-center" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px" }}>
              BENVENUTO/A {nickname.toUpperCase()}!
            </p>
          </div>
        )}
        
        {/* Main content */}
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
      
      <footer className="mt-8 border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px", color: '#FF6B35', textShadow: '1px 1px 0px #000' }}>
            PLAYGROUND JAM BOLOGNA &copy; 2026
          </p>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px", color: '#00ffff', textShadow: '1px 1px 0px #000' }}>
            CONTATTI: playgroundjam21@gmail.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
