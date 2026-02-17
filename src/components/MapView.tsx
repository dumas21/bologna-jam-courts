import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Playground } from "@/types/playground";
import PlaygroundCard from "./PlaygroundCard";
import LeafletMap from "./LeafletMap";
import { MapPin, List } from "lucide-react";

interface MapViewProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
  getPlayerCount: (id: string) => number;
  getFieldStatus: (id: string) => { label: string; color: string };
  getRatingAvg: (id: string) => number | null;
}

const MapView = ({
  playgrounds,
  selectedPlayground,
  onSelectPlayground,
  getPlayerCount,
  getFieldStatus,
  getRatingAvg,
}: MapViewProps) => {
  const [view, setView] = useState<'map' | 'list'>('map');

  return (
    <div className="relative w-full bg-black bg-opacity-90 backdrop-blur-sm border-2 border-jam-neon-orange p-3 md:p-4 overflow-hidden rounded-lg synthwave-bg">
      {/* View toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="text-xs font-press-start text-jam-neon-orange bg-black bg-opacity-90 px-3 py-2 rounded-lg border-2 border-jam-neon-orange text-center">
          BASKET CITY - {playgrounds.length} CAMPI
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('map')}
            className={`p-2 rounded-lg border-2 transition-all ${view === 'map' ? 'border-jam-neon-orange bg-jam-neon-orange/20' : 'border-white/20 hover:border-white/40'}`}
          >
            <MapPin size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg border-2 transition-all ${view === 'list' ? 'border-jam-neon-orange bg-jam-neon-orange/20' : 'border-white/20 hover:border-white/40'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {view === 'map' ? (
        <LeafletMap
          playgrounds={playgrounds}
          selectedPlayground={selectedPlayground}
          onSelectPlayground={onSelectPlayground}
          getPlayerCount={getPlayerCount}
          getFieldStatus={getFieldStatus}
          getRatingAvg={getRatingAvg}
        />
      ) : (
        <ScrollArea className="h-[400px] sm:h-[450px] md:h-[500px] pr-2 md:pr-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
            {playgrounds.length > 0 ? playgrounds.map(playground => (
              <PlaygroundCard
                key={playground.id}
                playground={playground}
                selectedPlayground={selectedPlayground}
                onSelectPlayground={onSelectPlayground}
              />
            )) : (
              <div className="col-span-full text-center font-press-start text-red-500 p-8">
                🚫 NESSUN PLAYGROUND DISPONIBILE
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default MapView;
