
import React from 'react';
import { Playground } from "@/types/playground";
import { MapPin, TreePine, Coffee, Lightbulb, Star } from "lucide-react";

interface PlaygroundCardProps {
  playground: Playground;
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
}

const PlaygroundCard: React.FC<PlaygroundCardProps> = ({ 
  playground, 
  selectedPlayground, 
  onSelectPlayground 
}) => {
  // 🔧 FORZA SEMPRE 2 CANESTRI PER GIARDINI MARGHERITA (ID "1")
  const basketCount = playground.id === "1" ? 2 : (playground.basketCount || 2);
  
  console.log(`PlaygroundCard - DEBUG: ${playground.name} (ID: ${playground.id}) - Canestri: ${basketCount}`);

  const isSelected = selectedPlayground?.id === playground.id;

  return (
    <div 
      className={`arcade-card p-4 cursor-pointer hover:bg-opacity-80 transition-all ${
        isSelected ? 'border-2 border-yellow-400' : ''
      }`}
      onClick={() => onSelectPlayground(playground)}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">{playground.name}</h4>
          <div className="flex items-center gap-1 text-xs text-gray-300 mb-2">
            <MapPin size={12} />
            <span>{playground.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold">CANESTRI:</span>
            <span className="font-bold text-yellow-400">{basketCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <TreePine size={12} />
            <span className="font-semibold">OMBRA:</span>
            <span>{playground.hasShade ? "SÌ" : "PARZIALE/NO"}</span>
          </div>

          <div className="flex items-center gap-1">
            <Coffee size={12} />
            <span className="font-semibold">RISTORO:</span>
            <span>
              {playground.refreshmentType === "interno" ? "INTERNO" :
              playground.refreshmentType === "esterno" ? "ESTERNO" : "NO"}
            </span>
          </div>

          {playground.hasLighting && (
            <div className="flex items-center gap-1">
              <Lightbulb size={12} />
              <span className="text-yellow-400">ILLUMINATO</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-2">
          <Star size={12} className="text-yellow-400" />
          <span className="text-green-400 font-bold">
            {playground.rating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-gray-400">({playground.ratingCount || 0} voti)</span>
        </div>
        <div className="text-blue-400">
          {playground.currentPlayers} online
        </div>
      </div>
    </div>
  );
};

export default PlaygroundCard;
