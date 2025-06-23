
import React from 'react';
import { Playground, PlaygroundFilters } from "@/types/playground";
import { MapPin, TreePine, Coffee, Lightbulb, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PlaygroundListProps {
  playgrounds: Playground[];
  filters: PlaygroundFilters;
  onSelectPlayground: (playground: Playground) => void;
}

const PlaygroundList: React.FC<PlaygroundListProps> = ({ playgrounds, filters, onSelectPlayground }) => {
  const navigate = useNavigate();

  console.log("PlaygroundList - Totale playground ricevuti:", playgrounds.length);
  console.log("PlaygroundList - Filtri applicati:", filters);

  // Filtra i playground in base ai filtri selezionati
  const filteredPlaygrounds = playgrounds.filter(playground => {
    const districtMatch = !filters.district || playground.district === filters.district;
    
    const shadeMatch = !filters.shade || 
      (filters.shade === "si" && playground.hasShade) ||
      (filters.shade === "no" && !playground.hasShade) ||
      (filters.shade === "parziale" && !playground.hasShade);
    
    const refreshmentMatch = !filters.refreshment || playground.refreshmentType === filters.refreshment;
    
    return districtMatch && shadeMatch && refreshmentMatch;
  });

  console.log("PlaygroundList - Playground dopo filtri:", filteredPlaygrounds.length);

  // Raggruppa i playground per quartiere
  const playgroundsByDistrict = filteredPlaygrounds.reduce((acc, playground) => {
    const district = playground.district || 'altro';
    if (!acc[district]) {
      acc[district] = [];
    }
    acc[district].push(playground);
    return acc;
  }, {} as Record<string, Playground[]>);

  const getDistrictName = (district: string) => {
    const districtNames: Record<string, string> = {
      'centro': 'CENTRO STORICO',
      'bolognina': 'BOLOGNINA',
      'savena': 'SAVENA',
      'san_donato': 'SAN DONATO',
      'murri': 'MURRI',
      'navile': 'NAVILE',
      'mazzini': 'MAZZINI',
      'altro': 'ALTRI'
    };
    return districtNames[district] || district.toUpperCase();
  };

  const getShadeText = (hasShade: boolean) => {
    return hasShade ? "SÌ" : "PARZIALE/NO";
  };

  const getRefreshmentText = (type?: string) => {
    const refreshmentNames: Record<string, string> = {
      'interno': 'INTERNO',
      'esterno': 'ESTERNO',
      'no': 'NO'
    };
    return refreshmentNames[type || 'no'] || 'NO';
  };

  const getBasketCount = (playground: Playground) => {
    // Forza sempre 2 canestri per Giardini Margherita
    if (playground.id === "1") return 2;
    return playground.basketCount || 2;
  };

  return (
    <div className="arcade-section p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold arcade-heading">BOLOGNA</h2>
        <Button 
          onClick={() => navigate("/")}
          className="arcade-button arcade-button-home text-xs px-2 py-2 md:px-4 md:py-3"
        >
          <Home size={14} />
          <span className="ml-1">HOME</span>
        </Button>
      </div>
      
      {filteredPlaygrounds.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">NESSUN PLAYGROUND CORRISPONDE AI FILTRI SELEZIONATI</p>
          <p className="text-gray-500 text-sm mt-2">Prova a rimuovere alcuni filtri per vedere più risultati</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(playgroundsByDistrict).map(([district, playgroundsInDistrict]) => (
            <div key={district} className="space-y-4">
              <h3 className="text-lg font-semibold arcade-heading text-orange-500">
                {getDistrictName(district)} ({playgroundsInDistrict.length})
              </h3>
              <div className="grid gap-3">
                {playgroundsInDistrict.map((playground) => (
                  <div 
                    key={playground.id}
                    className="arcade-card p-4 cursor-pointer hover:bg-opacity-80 transition-all"
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
                          <span className="font-bold text-yellow-400">{getBasketCount(playground)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <TreePine size={12} />
                          <span className="font-semibold">OMBRA:</span>
                          <span>{getShadeText(playground.hasShade)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Coffee size={12} />
                          <span className="font-semibold">RISTORO:</span>
                          <span>{getRefreshmentText(playground.refreshmentType)}</span>
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
                        <span className="text-green-400">★ {playground.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-400">({playground.ratingCount || 0} voti)</span>
                      </div>
                      <div className="text-blue-400">
                        {playground.currentPlayers} giocatori online
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaygroundList;
