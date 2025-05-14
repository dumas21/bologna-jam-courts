
import { Clock, MapPin, Users } from "lucide-react";
import { Playground } from "@/types/playground";
import { Button } from "@/components/ui/button";

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string) => void;
}

const PlaygroundDetail = ({ playground, onCheckIn }: PlaygroundDetailProps) => {
  const getShadeText = (hasShade: boolean) => {
    const currentHour = new Date().getHours();
    
    if (hasShade) {
      return currentHour > 11 && currentHour < 18 
        ? "Ombreggiato durante le ore più calde" 
        : "Ombreggiato parzialmente";
    }
    
    return currentHour > 11 && currentHour < 18 
      ? "Attenzione: nessuna ombra durante le ore più calde" 
      : "Nessuna area d'ombra";
  };
  
  return (
    <div className="pixel-card mt-4">
      <h2 className="font-press-start text-lg text-jam-orange mb-4">{playground.name}</h2>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <MapPin className="mr-2 text-jam-blue flex-shrink-0 mt-1" size={18} />
          <div>
            <div className="text-sm font-bold">Indirizzo</div>
            <div className="text-sm opacity-80">{playground.address}</div>
          </div>
        </div>
        
        <div className="flex items-start">
          <Clock className="mr-2 text-jam-pink flex-shrink-0 mt-1" size={18} />
          <div>
            <div className="text-sm font-bold">Orari</div>
            <div className="text-sm opacity-80">{playground.openHours}</div>
          </div>
        </div>
        
        <div className="flex items-start">
          <Users className="mr-2 text-jam-orange flex-shrink-0 mt-1" size={18} />
          <div>
            <div className="text-sm font-bold">Giocatori Presenti</div>
            <div className="text-sm opacity-80">
              {playground.currentPlayers} {playground.currentPlayers === 1 ? 'giocatore' : 'giocatori'}
            </div>
          </div>
        </div>
        
        <div className="bg-jam-dark/50 p-3 rounded mt-4">
          <div className="text-sm font-bold mb-1">Info aggiuntive:</div>
          <ul className="text-xs space-y-2 opacity-80">
            <li>• {getShadeText(playground.hasShade)}</li>
            <li>• {playground.hasFountain 
                ? "Fontanella disponibile nel campo" 
                : "Nessuna fontanella nel campo"}</li>
            <li>• {playground.hasAmenities 
                ? "Bar/gelaterie entro 100m" 
                : "Nessun bar/gelateria nelle vicinanze"}</li>
          </ul>
        </div>
        
        <div className="flex justify-between gap-4 mt-6">
          <Button 
            className="pixel-button flex-1 text-xs animate-pixel-bounce"
            onClick={() => onCheckIn(playground.id)}
          >
            Check-in
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundDetail;
