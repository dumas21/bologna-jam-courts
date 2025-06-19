
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
    <div className="relative w-full bg-black bg-opacity-90 backdrop-blur-sm border-2 md:border-3 border-orange-500 p-2 md:p-4 overflow-hidden rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 md:mb-6 gap-2 md:gap-4">
        <div className="text-xs md:text-sm nike-text text-white bg-black bg-opacity-90 px-2 md:px-4 py-2 md:py-3 rounded-lg border-2 border-orange-500 text-center w-full sm:w-auto">
          PLAYGROUND BOLOGNA - {playgrounds.length} CAMPI DISPONIBILI
        </div>
      </div>
      
      <ScrollArea className="h-[350px] sm:h-[400px] md:h-[450px] pr-1 md:pr-2 scroll-area">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 lg:gap-6">
          {playgrounds && playgrounds.length > 0 ? (
            playgrounds.map((playground) => (
              <div 
                key={playground.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedPlayground?.id === playground.id 
                    ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 scale-[1.01] md:scale-[1.02]' 
                    : 'bg-black bg-opacity-80 hover:bg-opacity-90'
                } backdrop-blur-sm p-2 md:p-4 lg:p-5 border-2 border-orange-500 rounded-lg hover:scale-[1.005] md:hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.995] md:active:scale-[0.99] touch-manipulation`}
                onClick={() => {
                  console.log("Selezionato playground:", playground);
                  onSelectPlayground(playground);
                  playBasketballSound();
                }}
              >
                <div className="flex flex-col gap-2 md:gap-3">
                  {/* Header con nome e info principali */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="playground-name bg-black bg-opacity-80 px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm font-bold text-white w-full sm:w-auto text-center sm:text-left">
                      {playground.name.toUpperCase()}
                    </div>
                    
                    {/* Info rapide in riga */}
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
                      <div className="flex items-center bg-black bg-opacity-80 px-2 md:px-3 py-1 md:py-2 rounded-full border-2 border-orange-500 min-w-[50px] md:min-w-[60px]">
                        <Users size={12} className="text-red-500 mr-1 md:mr-2 flex-shrink-0" />
                        <span className="text-xs md:text-sm nike-text text-white">{playground.currentPlayers}</span>
                      </div>
                      
                      {playground.hasLighting && (
                        <Lightbulb size={14} className="text-yellow-400 animate-neon-glow flex-shrink-0" />
                      )}
                      
                      {/* Basketball Icon per Google Maps - migliorato per mobile */}
                      <div 
                        className="basketball-icon flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-full border-2 border-orange-400 hover:bg-orange-500 transition-colors touch-manipulation shadow-lg active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMaps(playground.address);
                        }}
                        title="Apri in Google Maps"
                      >
                        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-orange-400 relative overflow-hidden">
                          <div className="absolute inset-0 border-2 border-orange-800 rounded-full"></div>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-orange-800"></div>
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-orange-800"></div>
                          <div className="absolute top-1/4 left-1/4 w-1 h-1 md:w-2 md:h-2 border border-orange-800 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indirizzo */}
                  <div className="text-xs md:text-sm text-white/90 nike-text break-words bg-black bg-opacity-50 px-2 py-1 rounded">
                    📍 {playground.address}
                  </div>
                  
                  {/* Info dettagliate in griglia mobile-friendly */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 text-xs nike-text">
                    <span className="text-white/80 bg-black bg-opacity-50 px-2 py-1 rounded">
                      🕒 {playground.openHours}
                    </span>
                    <span className="text-yellow-400 bg-black bg-opacity-50 px-2 py-1 rounded">
                      🏀 CANESTRI: {playground.basketCount}
                    </span>
                  </div>
                  
                  {/* Rating display */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white nike-text">{playground.rating.toFixed(1)}</span>
                      <span className="text-white/60 nike-text">({playground.ratingCount})</span>
                    </div>
                    
                    {/* Badges per amenità */}
                    <div className="flex gap-1">
                      {playground.hasShade && (
                        <span className="bg-green-600 text-white px-1 py-0.5 rounded text-xs">OMBRA</span>
                      )}
                      {playground.hasAmenities && (
                        <span className="bg-blue-600 text-white px-1 py-0.5 rounded text-xs">SERVIZI</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Display registered users if any */}
                  {isLoggedIn && playground.currentPlayers > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="text-xs text-white nike-text mb-1 bg-black bg-opacity-70 px-2 py-1 rounded inline-block">
                        CHECK-IN OGGI:
                      </div>
                      <div className="text-xs text-white/80 nike-text">
                        {nickname && 
                          <div className="flex items-center mb-1">
                            <Users size={10} className="text-blue-400 mr-1 flex-shrink-0" />
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
              </div>
            ))
          ) : (
            <div className="col-span-full text-center nike-text text-red-500 p-4 md:p-8">
              🚫 NESSUN PLAYGROUND DISPONIBILE
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MapView;
