
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
    <div className="relative w-full bg-black bg-opacity-90 backdrop-blur-lg border-4 border-orange-500 p-8 overflow-hidden rounded-lg glass-card">
      <div className="flex justify-between items-center mb-8">
        <div className="text-base nike-text text-white bg-black bg-opacity-90 px-6 py-3 rounded-lg border-3 border-orange-500">
          PLAYGROUND BOLOGNA - {playgrounds.length} CAMPI DISPONIBILI
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[400px] overflow-y-auto pr-2">
        {playgrounds && playgrounds.length > 0 ? (
          playgrounds.map((playground) => (
            <div 
              key={playground.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedPlayground?.id === playground.id 
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500' 
                  : 'bg-black bg-opacity-80'
              } backdrop-blur-sm p-6 border-3 border-orange-500 rounded-lg hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40`}
              onClick={() => {
                console.log("Selezionato playground:", playground);
                onSelectPlayground(playground);
                playBasketballSound();
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="playground-name bg-black bg-opacity-70 px-4 py-2 rounded">
                  {playground.name.toUpperCase()}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-black bg-opacity-80 px-4 py-2 rounded-full border-2 border-orange-500">
                    <Users size={16} className="text-red-500 mr-2" />
                    <span className="text-base nike-text text-white">{playground.currentPlayers}</span>
                  </div>
                  {playground.hasLighting && (
                    <Lightbulb size={16} className="text-yellow-400 animate-neon-glow" />
                  )}
                  {/* Enhanced Basketball Shoes Icon for Google Maps */}
                  <div 
                    className="shoes-icon flex items-center justify-center"
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
              
              <div className="text-base text-white/90 mb-3 nike-text">
                📍 {playground.address}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm nike-text text-white/80">
                  🕒 {playground.openHours}
                </span>
                <span className="text-base nike-text text-yellow-400">
                  CANESTRI: {playground.basketCount}
                </span>
              </div>
              
              {/* Display registered users if any */}
              {isLoggedIn && playground.currentPlayers > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-sm text-white nike-text mb-2 bg-black bg-opacity-70 px-3 py-1 rounded">
                    CHECK-IN OGGI:
                  </div>
                  <div className="text-sm text-white/80 nike-text">
                    {nickname && 
                      <div className="flex items-center mb-1">
                        <Users size={14} className="text-blue-400 mr-2" />
                        <span className="nike-text text-blue-400">{nickname.toUpperCase()}</span>
                      </div>
                    }
                    {playground.currentPlayers > (nickname ? 1 : 0) && 
                      <div className="text-sm text-white/60 nike-text">
                        + ALTRI {playground.currentPlayers - (nickname ? 1 : 0)} GIOCATORI
                      </div>
                    }
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center nike-text text-red-500 p-8">
            🚫 NESSUN PLAYGROUND DISPONIBILE
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
