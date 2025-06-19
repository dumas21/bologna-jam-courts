
import { Users, Lightbulb } from "lucide-react";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MapViewProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
}

const MapView = ({ playgrounds, selectedPlayground, onSelectPlayground }: MapViewProps) => {
  const { isLoggedIn, nickname } = useUser();
  
  const playBasketballSound = () => {
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Basketball sound error:', err));
  };
  
  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/maps?q=${encodedAddress}`;
    window.open(url, '_blank');
    
    // Play basketball sound
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Basketball sound error:', err));
  };
  
  return (
    <div className="relative w-full bg-black bg-opacity-90 backdrop-blur-sm border-3 border-orange-500 p-4 md:p-6 overflow-hidden rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="text-sm md:text-base nike-text text-white bg-black bg-opacity-90 px-4 py-3 rounded-lg border-2 border-orange-500 text-center">
          PLAYGROUND BOLOGNA - {playgrounds.length} CAMPI DISPONIBILI
        </div>
      </div>
      
      <ScrollArea className="h-[400px] md:h-[450px] pr-2 scroll-area">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {playgrounds && playgrounds.length > 0 ? (
            playgrounds.map((playground) => (
              <div 
                key={playground.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedPlayground?.id === playground.id 
                    ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 scale-[1.02]' 
                    : 'bg-black bg-opacity-80 hover:bg-opacity-90'
                } backdrop-blur-sm p-4 md:p-5 border-2 md:border-3 border-orange-500 rounded-lg hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] touch-manipulation`}
                onClick={() => {
                  console.log("Selezionato playground:", playground);
                  onSelectPlayground(playground);
                  playBasketballSound();
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                  <div className="playground-name bg-black bg-opacity-80 px-3 py-2 rounded text-xs md:text-sm font-bold text-white">
                    {playground.name.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center bg-black bg-opacity-80 px-3 py-2 rounded-full border-2 border-orange-500 min-w-[60px]">
                      <Users size={14} className="text-red-500 mr-2 flex-shrink-0" />
                      <span className="text-sm nike-text text-white">{playground.currentPlayers}</span>
                    </div>
                    {playground.hasLighting && (
                      <Lightbulb size={16} className="text-yellow-400 animate-neon-glow flex-shrink-0" />
                    )}
                    {/* Enhanced Basketball Shoes Icon for Google Maps */}
                    <div 
                      className="shoes-icon flex items-center justify-center w-10 h-10 bg-black bg-opacity-80 rounded-full border-2 border-orange-500 hover:bg-orange-500 transition-colors touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGoogleMaps(playground.address);
                      }}
                      title="Apri in Google Maps"
                    >
                      <span className="text-lg">👟</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs md:text-sm text-white/90 mb-3 nike-text break-words">
                  📍 {playground.address}
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-2">
                  <span className="text-xs nike-text text-white/80 flex-shrink-0">
                    🕒 {playground.openHours}
                  </span>
                  <span className="text-xs md:text-sm nike-text text-yellow-400 flex-shrink-0">
                    CANESTRI: {playground.basketCount}
                  </span>
                </div>
                
                {/* Display registered users if any */}
                {isLoggedIn && playground.currentPlayers > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/20">
                    <div className="text-xs text-white nike-text mb-2 bg-black bg-opacity-70 px-2 py-1 rounded inline-block">
                      CHECK-IN OGGI:
                    </div>
                    <div className="text-xs text-white/80 nike-text">
                      {nickname && 
                        <div className="flex items-center mb-1">
                          <Users size={12} className="text-blue-400 mr-2 flex-shrink-0" />
                          <span className="nike-text text-blue-400 break-words">{nickname.toUpperCase()}</span>
                        </div>
                      }
                      {playground.currentPlayers > (nickname ? 1 : 0) && 
                        <div className="text-xs text-white/60 nike-text">
                          + ALTRI {playground.currentPlayers - (nickname ? 1 : 0)} GIOCATORI
                        </div>
                      }
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center nike-text text-red-500 p-8">
              🚫 NESSUN PLAYGROUND DISPONIBILE
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MapView;
