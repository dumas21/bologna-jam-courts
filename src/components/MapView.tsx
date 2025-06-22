import { Users, Lightbulb, Clock, Star, Calendar, ExternalLink, Signpost } from "lucide-react";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import BasketballWithFlames from "./BasketballWithFlames";
import EventAlert from "./EventAlert";

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
  
  const openGoogleMaps = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/maps?q=${encodedAddress}`;
    window.open(url, '_blank');
    
    // Play basketball sound
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Basketball sound error:', err));
  };

  const openEventLink = (link: string) => {
    window.open(link, '_blank');
    
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Event link sound error:', err));
  };
  
  const scrollToPlaygroundDetails = () => {
    // Scroll to playground details section
    setTimeout(() => {
      const detailsSection = document.querySelector('[data-playground-details]');
      if (detailsSection) {
        detailsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
    
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Basketball sound error:', err));
  };
  
  return (
    <div className="relative w-full bg-black bg-opacity-90 backdrop-blur-sm border-2 md:border-3 border-orange-500 p-3 md:p-4 overflow-hidden rounded-lg synthwave-bg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 gap-2 md:gap-4">
        <div className="text-xs md:text-sm nike-text text-white bg-black bg-opacity-90 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-orange-500 text-center w-full sm:w-auto retro-neon-text">
          PLAYGROUND BOLOGNA - {playgrounds.length} CAMPI DISPONIBILI
        </div>
      </div>
      
      <ScrollArea className="h-[400px] sm:h-[450px] md:h-[500px] pr-2 md:pr-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          {playgrounds && playgrounds.length > 0 ? (
            playgrounds.map((playground) => (
              <div 
                key={playground.id}
                className={`group cursor-pointer transition-all duration-300 transform ${
                  selectedPlayground?.id === playground.id 
                    ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 scale-[1.02] shadow-xl shadow-orange-500/50' 
                    : 'bg-black bg-opacity-80 hover:bg-opacity-95 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/20'
                } backdrop-blur-sm border-2 border-orange-500 rounded-xl overflow-hidden active:scale-[0.98] touch-manipulation`}
                onClick={() => {
                  console.log("Selezionato playground:", playground);
                  onSelectPlayground(playground);
                  playBasketballSound();
                }}
              >
                {/* Header compatto e mobile-friendly */}
                <div className="p-3 md:p-4 space-y-3">
                  {/* Evento in corso - con il nuovo componente EventAlert */}
                  {playground.currentEvent && playground.currentEvent.isActive && (
                    <EventAlert
                      eventName={playground.currentEvent.name}
                      eventLink={playground.currentEvent.link}
                      onClick={() => playground.currentEvent?.link && openEventLink(playground.currentEvent.link)}
                    />
                  )}

                  {/* Nome con stile retro anni 80 RIPRISTINATO */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="playground-name text-sm md:text-base font-bold flex-1 text-center sm:text-left retro-neon-text animate-neon-glow" 
                         style={{
                           fontFamily: "'Press Start 2P', monospace",
                           color: "#FF6B35",
                           textShadow: "2px 2px 0px #000, 0 0 10px #FF6B35, 0 0 20px #FFD700",
                           textTransform: "uppercase",
                           letterSpacing: "2px",
                           background: "rgba(0, 0, 0, 0.9)",
                           padding: "8px 12px",
                           borderRadius: "8px",
                           border: "2px solid #FF6B35",
                           boxShadow: "0 0 15px rgba(255, 107, 53, 0.6)"
                         }}>
                      {playground.name.toUpperCase()}
                    </div>
                    
                    {/* Controlli rapidi - più grandi per mobile */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                      <div className="flex items-center bg-black bg-opacity-90 px-3 py-2 rounded-full border-2 border-orange-500 min-w-[60px]">
                        <Users size={14} className="text-red-500 mr-2 flex-shrink-0" />
                        <span className="text-sm font-bold nike-text text-white">{playground.currentPlayers}</span>
                      </div>
                      
                      {playground.hasLighting && (
                        <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-full border border-yellow-400">
                          <Lightbulb size={16} className="text-yellow-400 animate-pulse" />
                        </div>
                      )}
                      
                      {/* Pulsante Maps con cartello stradale più grande */}
                      <button 
                        className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-400 rounded-full border-3 border-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation retro-neon-glow"
                        onClick={(e) => openGoogleMaps(playground.address, e)}
                        title="Apri in Google Maps"
                        style={{
                          boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(255,255,255,0.1)'
                        }}
                      >
                        <Signpost size={32} className="drop-shadow-lg text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Info principali in card compatte */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
                      <Signpost size={12} className="text-cyan-400 mr-2 flex-shrink-0" />
                      <span className="text-white/90 nike-text truncate">{playground.address}</span>
                    </div>
                    
                    <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
                      <Clock size={12} className="text-blue-400 mr-2 flex-shrink-0" />
                      <span className="text-white/90 nike-text">{playground.openHours}</span>
                    </div>
                    
                    <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
                      <span className="text-yellow-400 mr-2">🏀</span>
                      <span className="text-white/90 nike-text">CANESTRI: {playground.basketCount}</span>
                    </div>
                    
                    <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
                      <Star size={12} className="text-yellow-400 mr-2 flex-shrink-0" />
                      <span className="text-white/90 nike-text">{playground.rating?.toFixed(1)} ({playground.ratingCount})</span>
                    </div>
                  </div>
                  
                  {/* Badges delle amenità */}
                  <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                    {playground.hasShade && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">OMBRA</span>
                    )}
                    {playground.hasAmenities && (
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">SERVIZI</span>
                    )}
                    {playground.hasLighting && (
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold">ILLUMINATO</span>
                    )}
                  </div>
                  
                  {/* Check-in info se l'utente è loggato */}
                  {isLoggedIn && playground.currentPlayers > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-xs text-white nike-text mb-2 bg-black bg-opacity-70 px-2 py-1 rounded inline-block">
                        CHECK-IN OGGI:
                      </div>
                      <div className="text-xs text-white/80 nike-text space-y-1">
                        {nickname && 
                          <div className="flex items-center">
                            <Users size={10} className="text-blue-400 mr-2 flex-shrink-0" />
                            <span className="nike-text text-blue-400 font-bold">{nickname.toUpperCase()}</span>
                          </div>
                        }
                        {playground.currentPlayers > (nickname ? 1 : 0) && 
                          <div className="text-xs text-white/60 nike-text ml-4">
                            + ALTRI {playground.currentPlayers - (nickname ? 1 : 0)} GIOCATORI
                          </div>
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Indicatore di selezione con pulsante per andare ai dettagli */}
                  {selectedPlayground?.id === playground.id && (
                    <div className="text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToPlaygroundDetails();
                        }}
                        className="inline-block bg-white text-black px-4 py-2 rounded-full text-xs font-bold animate-pulse hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        ✓ VAI A METEO E CHAT
                      </button>
                    </div>
                  )}
                </div>
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
