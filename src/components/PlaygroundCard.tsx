
import { Users, Lightbulb, Clock, Star, Signpost } from "lucide-react";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { openSecureExternalLink } from "@/config/security";
import PlaygroundStats from "./PlaygroundStats";
import PlaygroundControls from "./PlaygroundControls";

interface PlaygroundCardProps {
  playground: Playground;
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
}

const PlaygroundCard = ({ playground, selectedPlayground, onSelectPlayground }: PlaygroundCardProps) => {
  const { isLoggedIn, nickname } = useUser();
  
  const playBasketballSound = () => {
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(err => console.log('Basketball sound error:', err));
  };
  
  const openGoogleMaps = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/maps?q=${encodedAddress}`;
    
    openSecureExternalLink(url);
    
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Basketball sound error:', err));
  };

  const openEventLink = (link: string) => {
    openSecureExternalLink(link);
    
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Event link sound error:', err));
  };
  
  const scrollToPlaygroundDetails = () => {
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
      <div className="p-3 md:p-4 space-y-3">
        {/* Nome con stile retro anni 80 */}
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
          
          <PlaygroundControls 
            playground={playground}
            onMapsClick={openGoogleMaps}
          />
        </div>

        {/* Banner EVENTO IN CORSO per Giardini Margherita */}
        {playground.id === "1" && (
          <div 
            className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-3 rounded-lg border-3 border-yellow-400 cursor-pointer transform hover:scale-105 transition-transform text-center relative z-10"
            onClick={(e) => {
              e.stopPropagation();
              const link = playground.currentEvent?.link || "https://www.comune.bologna.it/eventi/torneo-streetball";
              openEventLink(link);
            }}
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 20px #FF00FF, 0 0 40px #FF0000'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl animate-bounce">🏆</span>
              <span 
                className="text-yellow-300 font-bold text-sm animate-pulse"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  textShadow: "2px 2px 0px #000, 0 0 10px #FFD700",
                  letterSpacing: "2px"
                }}
              >
                EVENTO IN CORSO
              </span>
              <span className="text-2xl animate-bounce">🏆</span>
            </div>
            <div 
              className="text-white font-bold text-xs hover:text-yellow-300 transition-colors"
              style={{ 
                fontFamily: "'Press Start 2P', monospace",
                textShadow: "1px 1px 0px #000, 0 0 8px #FFFF00",
                letterSpacing: "1px"
              }}
            >
              TORNEO STREETBALL 3VS3
            </div>
            <div className="mt-1 text-yellow-300 text-xs font-bold bg-black bg-opacity-60 px-2 py-1 rounded-full inline-block border border-yellow-400 animate-pulse">
              CLICCA PER INFO
            </div>
          </div>
        )}
        
        <PlaygroundStats playground={playground} />
        
        {/* Badges delle amenità - NASCOSTI per Giardini Margherita quando c'è l'evento */}
        {!(playground.id === "1") && (
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
        )}
        
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
  );
};

export default PlaygroundCard;
