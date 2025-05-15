
import { MapPin, Users, Lightbulb } from "lucide-react";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
}

const MapView = ({ playgrounds, selectedPlayground, onSelectPlayground }: MapViewProps) => {
  const { isLoggedIn, username } = useUser();
  
  // Function to open Google Maps with the Bologna playground search
  const openGoogleMaps = () => {
    // Open Google Maps with a search for playgrounds in Bologna
    window.open("https://maps.app.goo.gl/S65CFKEcTu7QZ7zW6", "_blank");
    
    // Play sound effect
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  return (
    <div className="relative w-full bg-jam-dark bg-opacity-50 backdrop-blur-sm border-2 border-white p-4 overflow-hidden rounded-md">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-press-start text-jam-orange">
          Playground Map
        </div>
        
        <Button 
          onClick={openGoogleMaps}
          className="bg-jam-purple text-white text-xs font-press-start px-4 py-2 rounded hover:bg-jam-blue transition-colors"
        >
          <MapPin size={16} className="mr-2" />
          Apri Google Maps
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
        {playgrounds.map(playground => (
          <div 
            key={playground.id}
            className={`cursor-pointer transition-colors ${
              selectedPlayground?.id === playground.id 
                ? 'bg-jam-purple bg-opacity-80' 
                : 'bg-black bg-opacity-60'
            } backdrop-blur-sm p-3 border border-white/20 rounded-md`}
            onClick={() => onSelectPlayground(playground)}
          >
            <div className="flex justify-between items-start">
              <div className="font-press-start text-xs mb-2 text-jam-pink">
                {playground.name}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-jam-dark px-2 py-1 rounded">
                  <Users size={12} className="text-jam-orange mr-1" />
                  <span className="text-xs font-press-start">{playground.currentPlayers}</span>
                </div>
                {playground.hasLighting && (
                  <Lightbulb size={12} className="text-jam-yellow" />
                )}
              </div>
            </div>
            <div className="text-xs text-white/70 mb-1">
              {playground.address}
            </div>
            <div className="flex items-center mt-2">
              <MapPin size={12} className="text-jam-blue mr-1" />
              <span className="text-xs">
                {playground.openHours}
              </span>
            </div>
            
            {/* Display registered users if any */}
            {isLoggedIn && playground.currentPlayers > 0 && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="text-xs text-jam-orange font-press-start mb-1">Presenze:</div>
                <div className="text-xs text-white/70 italic">
                  {username && 
                    <div className="flex items-center">
                      <Users size={10} className="text-jam-blue mr-1" />
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
        ))}
      </div>
    </div>
  );
};

export default MapView;
