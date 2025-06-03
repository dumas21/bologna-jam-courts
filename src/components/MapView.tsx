
import { Users, Lightbulb } from "lucide-react";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";

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
    <div className="relative w-full bg-black bg-opacity-80 backdrop-blur-lg border-4 border-transparent p-6 overflow-hidden rounded-lg glass-card">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-bold text-white bg-black bg-opacity-80 px-4 py-2 rounded-lg border-2 border-orange-500">
          PLAYGROUND BOLOGNA - {playgrounds.length} CAMPI DISPONIBILI
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2">
        {playgrounds && playgrounds.length > 0 ? (
          playgrounds.map((playground) => (
            <div 
              key={playground.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedPlayground?.id === playground.id 
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500' 
                  : 'bg-black bg-opacity-70'
              } backdrop-blur-sm p-4 border-2 border-orange-500 rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30`}
              onClick={() => {
                console.log("Selezionato playground:", playground);
                onSelectPlayground(playground);
                playBasketballSound();
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-lg text-white bg-black bg-opacity-60 px-3 py-1 rounded">
                  {playground.name.toUpperCase()}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-black bg-opacity-70 px-3 py-1 rounded-full border border-orange-500">
                    <Users size={14} className="text-red-500 mr-2" />
                    <span className="text-sm font-orbitron font-bold text-white">{playground.currentPlayers}</span>
                  </div>
                  {playground.hasLighting && (
                    <Lightbulb size={14} className="text-yellow-400 animate-neon-glow" />
                  )}
                  {/* Basketball Shoes Icon for Google Maps */}
                  <div 
                    className="shoes-icon w-8 h-8 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGoogleMaps(playground.address);
                    }}
                    title="Apri in Google Maps"
                  >
                    👟
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-white/90 mb-2 font-exo font-medium">
                📍 {playground.address}
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-exo text-white/80">
                  🕒 {playground.openHours}
                </span>
                <span className="text-sm font-orbitron font-bold text-yellow-400">
                  Canestri: {playground.basketCount}
                </span>
              </div>
              
              {/* Display registered users if any */}
              {isLoggedIn && playground.currentPlayers > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-xs text-white font-bold mb-2 bg-black bg-opacity-60 px-2 py-1 rounded">
                    CHECK-IN OGGI:
                  </div>
                  <div className="text-sm text-white/80 font-exo">
                    {nickname && 
                      <div className="flex items-center mb-1">
                        <Users size={12} className="text-blue-400 mr-2" />
                        <span className="font-bold text-blue-400">{nickname.toUpperCase()}</span>
                      </div>
                    }
                    {playground.currentPlayers > (nickname ? 1 : 0) && 
                      <div className="text-xs text-white/60 font-exo">
                        + altri {playground.currentPlayers - (nickname ? 1 : 0)} giocatori
                      </div>
                    }
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-orbitron p-6">
            🚫 NESSUN PLAYGROUND DISPONIBILE
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
