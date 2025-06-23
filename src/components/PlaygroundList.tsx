
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

  return (
    <div className="arcade-section p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold arcade-heading text-orange-500" style={{
          fontFamily: "'Press Start 2P', monospace",
          textShadow: "2px 2px 0px #000, 0 0 10px #FF6B35",
          letterSpacing: "2px"
        }}>
          PLAYGROUND BOLOGNA
        </h2>
        <Button 
          onClick={() => navigate("/")}
          className="text-xs px-3 py-2 md:px-4 md:py-3 font-bold text-white border-2 border-orange-500 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            background: "linear-gradient(45deg, #FF6B35, #FFD700)",
            textShadow: "1px 1px 0px #000",
            boxShadow: "0 0 15px rgba(255, 107, 53, 0.6)"
          }}
        >
          <Home size={14} />
          <span className="ml-1">HOME</span>
        </Button>
      </div>

      {/* Messaggio nuove città rinominato */}
      <div className="mb-6 p-6 rounded-xl border-4 border-yellow-400 text-center" style={{
        background: "linear-gradient(45deg, #8B00FF, #FF1493, #FF0000)",
        animation: 'pulse 2s ease-in-out infinite',
        boxShadow: '0 0 30px #FF00FF, 0 0 60px #FF0000'
      }}>
        <h3 className="text-xl font-bold text-yellow-300 mb-3" style={{
          fontFamily: "'Press Start 2P', monospace",
          textShadow: "3px 3px 0px #000, 0 0 15px #FFD700",
          letterSpacing: "3px"
        }}>
          🚀 NUOVI PLAYGROUND IN ARRIVO! 🚀
        </h3>
        <p className="text-sm text-white mb-3 font-bold">
          A breve saranno disponibili nuovi playground nel network Playground Jam come Roma, Milano, Napoli e altre città!
        </p>
        <div className="text-xs text-yellow-200 font-bold bg-black bg-opacity-70 px-4 py-2 rounded-full inline-block border-2 border-yellow-400">
          📧 playgroundjam21@gmail.com per info
        </div>
      </div>
      
      {filteredPlaygrounds.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 font-bold" style={{
            fontFamily: "'Press Start 2P', monospace",
            textShadow: "1px 1px 0px #000"
          }}>
            NESSUN PLAYGROUND TROVATO
          </p>
          <p className="text-gray-500 text-sm mt-2">Prova a rimuovere alcuni filtri per vedere più risultati</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(playgroundsByDistrict).map(([district, playgroundsInDistrict]) => (
            <div key={district} className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-500" style={{
                fontFamily: "'Press Start 2P', monospace",
                textShadow: "2px 2px 0px #000, 0 0 10px #FF6B35",
                letterSpacing: "2px"
              }}>
                {getDistrictName(district)} ({playgroundsInDistrict.length})
              </h3>
              <div className="grid gap-3">
                {playgroundsInDistrict.map((playground) => (
                  <div 
                    key={playground.id}
                    className="p-4 cursor-pointer transition-all border-2 border-orange-500 rounded-lg hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      background: "rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(10px)"
                    }}
                    onClick={() => onSelectPlayground(playground)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1" style={{
                          fontFamily: "'Press Start 2P', monospace",
                          textShadow: "1px 1px 0px #000"
                        }}>
                          {playground.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-300 mb-2">
                          <MapPin size={12} />
                          <span>{playground.address}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">CANESTRI:</span>
                          <span className="font-bold text-yellow-400">{playground.basketCount || 2}</span>
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
