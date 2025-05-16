
import { Users, Lightbulb } from "lucide-react";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";

interface MapViewProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
}

const MapView = ({ playgrounds, selectedPlayground, onSelectPlayground }: MapViewProps) => {
  const { isLoggedIn, username } = useUser();
  
  return (
    <div className="relative w-full bg-black bg-opacity-70 backdrop-blur-sm border-2 border-red-600 p-4 overflow-hidden rounded-md">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-press-start text-red-600">
          Playground Bologna - {playgrounds.length} campi disponibili
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
        {playgrounds.length > 0 ? (
          playgrounds.map(playground => (
            <div 
              key={playground.id}
              className={`cursor-pointer transition-colors ${
                selectedPlayground?.id === playground.id 
                  ? 'bg-red-600 bg-opacity-70' 
                  : 'bg-black bg-opacity-70'
              } backdrop-blur-sm p-3 border border-white/20 rounded-md`}
              onClick={() => {
                onSelectPlayground(playground);
                // Play sound effect
                const audio = new Audio('/sounds/select.mp3');
                audio.play().catch(err => console.log('Audio playback error:', err));
              }}
            >
              <div className="flex justify-between items-start">
                <div className="font-press-start text-xs mb-2 text-blue-400">
                  {playground.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-black px-2 py-1 rounded">
                    <Users size={12} className="text-red-600 mr-1" />
                    <span className="text-xs font-press-start">{playground.currentPlayers}</span>
                  </div>
                  {playground.hasLighting && (
                    <Lightbulb size={12} className="text-yellow-400" />
                  )}
                </div>
              </div>
              <div className="text-xs text-white/70 mb-1">
                {playground.address}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs">
                  {playground.openHours}
                </span>
              </div>
              
              {/* Display registered users if any */}
              {isLoggedIn && playground.currentPlayers > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-xs text-red-600 font-press-start mb-1">Presenze:</div>
                  <div className="text-xs text-white/70 italic">
                    {username && 
                      <div className="flex items-center">
                        <Users size={10} className="text-blue-400 mr-1" />
                        <span>{username}</span>
                      </div>
                    }
                    {playground.currentPlayers > (username ? 1 : 0) && 
                      <div className="text-xs text-white/50">
                        + altri {playground.currentPlayers - (username ? 1 : 0)} giocatori
                      </div>
                    }
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-red-600 font-press-start p-4">
            Nessun playground disponibile
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
