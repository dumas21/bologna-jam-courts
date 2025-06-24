
import { ScrollArea } from "@/components/ui/scroll-area";
import { Playground } from "@/types/playground";
import PlaygroundCard from "./PlaygroundCard";

interface MapViewProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
}

const MapView = ({ playgrounds, selectedPlayground, onSelectPlayground }: MapViewProps) => {
  return (
    <div className="relative w-full bg-black bg-opacity-90 backdrop-blur-sm border-2 md:border-3 border-orange-500 p-3 md:p-4 overflow-hidden rounded-lg synthwave-bg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 gap-2 md:gap-4">
        <div className="text-xs md:text-sm nike-text text-white bg-black bg-opacity-90 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-orange-500 text-center w-full sm:w-auto retro-neon-text">
          BASKET CITY - 9 CAMPI DISPONIBILI
        </div>
      </div>
      
      <ScrollArea className="h-[400px] sm:h-[450px] md:h-[500px] pr-2 md:pr-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          {playgrounds && playgrounds.length > 0 ? (
            playgrounds.map((playground) => (
              <PlaygroundCard
                key={playground.id}
                playground={playground}
                selectedPlayground={selectedPlayground}
                onSelectPlayground={onSelectPlayground}
              />
            ))
          ) : (
            <div className="col-span-full text-center nike-text text-red-500 p-8">
              🚫 NESSUN PLAYGROUND DISPONIBILE
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MapView;
