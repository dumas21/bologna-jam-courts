
import { useState } from "react";
import { MapPin, Users } from "lucide-react";
import { Playground } from "@/types/playground";

interface MapViewProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
}

const MapView = ({ playgrounds, selectedPlayground, onSelectPlayground }: MapViewProps) => {
  // This is a placeholder for an actual map integration
  // In a real app, we'd integrate with Google Maps API here
  
  return (
    <div className="relative w-full h-[400px] bg-jam-dark border-2 border-white p-4 overflow-hidden">
      <div className="text-xs font-press-start text-jam-orange mb-4">
        [Map Placeholder - Google Maps API would be integrated here]
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playgrounds.map(playground => (
          <div 
            key={playground.id}
            className={`pixel-card cursor-pointer transition-colors ${
              selectedPlayground?.id === playground.id ? 'bg-jam-purple' : 'bg-jam-dark'
            }`}
            onClick={() => onSelectPlayground(playground)}
          >
            <div className="flex justify-between items-start">
              <div className="font-press-start text-xs mb-2 text-jam-pink">
                {playground.name}
              </div>
              <div className="flex items-center bg-jam-dark px-2 py-1 rounded">
                <Users size={12} className="text-jam-orange mr-1" />
                <span className="text-xs font-press-start">{playground.currentPlayers}</span>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
