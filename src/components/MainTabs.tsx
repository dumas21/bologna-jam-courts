
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import PlaygroundFiltersComponent from "@/components/PlaygroundFilters";
import { Playground, PlaygroundFilters } from "@/types/playground";

interface MainTabsProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
  onCheckIn: (playgroundId: string, userNickname: string) => boolean;
  onCheckOut: (playgroundId: string, userNickname: string) => boolean;
  hasUserCheckedIn: (playgroundId: string, userNickname: string) => boolean;
  checkInRecords: { [playgroundId: string]: string[] };
  onRatingUpdate: (playgroundId: string, newRating: number, newRatingCount: number) => void;
  playSoundEffect: (action: string) => void;
  scrollToTop: () => void;
}

const MainTabs = ({
  playgrounds,
  selectedPlayground,
  onSelectPlayground,
  onCheckIn,
  onCheckOut,
  hasUserCheckedIn,
  checkInRecords,
  onRatingUpdate,
  playSoundEffect,
  scrollToTop
}: MainTabsProps) => {
  const [filters, setFilters] = useState<PlaygroundFilters>({
    district: "",
    shade: "",
    refreshment: ""
  });

  const handleTabClick = (action: string) => {
    playSoundEffect('tab');
    scrollToTop();
  };

  return (
    <Tabs defaultValue="map" className="w-full arcade-main-tabs">
      <TabsList className="w-full grid grid-cols-2 mb-2 md:mb-4 arcade-main-tab-list h-auto">
        <TabsTrigger 
          value="map" 
          className="text-xs md:text-sm arcade-main-tab py-3 px-2"
          onClick={() => handleTabClick('map')}
        >
          <span className="hidden sm:inline">MAPPA</span>
          <span className="inline sm:hidden">MAP</span>
        </TabsTrigger>
        <TabsTrigger 
          value="playground" 
          className="text-xs md:text-sm arcade-main-tab py-3 px-2"
          onClick={() => handleTabClick('playground')}
        >
          <span className="hidden sm:inline">PLAYGROUND</span>
          <span className="inline sm:hidden">PLAY</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="map" className="arcade-fade-in mt-2">
        <div className="arcade-section p-2 md:p-4">
          <MapView 
            playgrounds={playgrounds} 
            selectedPlayground={selectedPlayground}
            onSelectPlayground={onSelectPlayground} 
          />
        </div>
        
        {selectedPlayground && (
          <div className="mt-2 md:mt-4" data-playground-details>
            <PlaygroundDetail 
              playground={selectedPlayground} 
              onCheckIn={onCheckIn}
              onCheckOut={onCheckOut}
              hasUserCheckedIn={hasUserCheckedIn}
              checkInRecords={checkInRecords}
              onRatingUpdate={onRatingUpdate}
            />
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="playground" className="arcade-fade-in mt-2">
        <div className="arcade-section h-auto flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-2xl">
            <h2 className="text-xl md:text-2xl arcade-heading text-orange-500">🏀 PLAYGROUND JAM ITALIA 🏀</h2>
            <p className="text-sm md:text-base arcade-text text-white">
              STIAMO ESPANDENDO IN TUTTA ITALIA! PRESTO DISPONIBILI NUOVE CITTÀ
            </p>
            
            <div className="arcade-mini-leaderboard bg-black bg-opacity-80 p-6 rounded-xl border-2 border-orange-500">
              <h3 className="text-lg md:text-xl mb-4 text-yellow-400 font-bold">🚀 PROSSIME CITTÀ:</h3>
              <div className="space-y-3 text-sm md:text-base">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg">
                  <span className="font-bold">🏛️ ROMA</span>
                  <span className="text-yellow-300">COMING SOON</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg">
                  <span className="font-bold">🏙️ MILANO</span>
                  <span className="text-yellow-300">COMING SOON</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg">
                  <span className="font-bold">🌋 NAPOLI</span>
                  <span className="text-yellow-300">COMING SOON</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg">
                  <span className="font-bold">🌊 GENOVA</span>
                  <span className="text-yellow-300">COMING SOON</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-600 to-red-500 rounded-lg">
                  <span className="font-bold">🎭 FIRENZE</span>
                  <span className="text-yellow-300">COMING SOON</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-xl border-2 border-yellow-400">
              <h4 className="text-lg font-bold text-yellow-300 mb-2">🎯 VUOI LA TUA CITTÀ?</h4>
              <p className="text-sm text-white mb-3">
                Contattaci per aggiungere la tua città al network!
              </p>
              <p className="text-xs text-yellow-200">
                📧 playgroundjam21@gmail.com
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs;
