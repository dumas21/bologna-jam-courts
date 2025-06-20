
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import PlaygroundFiltersComponent from "@/components/PlaygroundFilters";
import PlaygroundList from "@/components/PlaygroundList";
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
      <TabsList className="w-full grid grid-cols-3 mb-2 md:mb-4 arcade-main-tab-list h-auto">
        <TabsTrigger 
          value="map" 
          className="text-xs md:text-sm arcade-main-tab py-3 px-2"
          onClick={() => handleTabClick('map')}
        >
          <span className="hidden sm:inline">MAPPA</span>
          <span className="inline sm:hidden">MAP</span>
        </TabsTrigger>
        <TabsTrigger 
          value="list" 
          className="text-xs md:text-sm arcade-main-tab py-3 px-2"
          onClick={() => handleTabClick('list')}
        >
          <span className="hidden sm:inline">LISTA</span>
          <span className="inline sm:hidden">LIST</span>
        </TabsTrigger>
        <TabsTrigger 
          value="italia" 
          className="text-xs md:text-sm arcade-main-tab py-3 px-2"
          onClick={() => handleTabClick('italia')}
        >
          <span className="hidden sm:inline">ITALIA</span>
          <span className="inline sm:hidden">ITA</span>
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

      <TabsContent value="list" className="arcade-fade-in mt-2">
        <PlaygroundFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
        <PlaygroundList
          playgrounds={playgrounds}
          filters={filters}
          onSelectPlayground={onSelectPlayground}
        />
        
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
      
      <TabsContent value="italia" className="arcade-fade-in mt-2">
        <div className="arcade-section h-48 md:h-64 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-2 md:space-y-4">
            <h2 className="text-base md:text-xl arcade-heading">LISTA ITALIA</h2>
            <p className="text-xs md:text-base max-w-md arcade-text">
              A BREVE ALTRI PLAYGROUND IN ALTRE CITTÀ ITALIANE
            </p>
            <div className="arcade-mini-leaderboard">
              <h3 className="text-sm md:text-lg mb-2">TOP CITIES COMING SOON:</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div>1. MILANO - COMING SOON</div>
                <div>2. ROMA - COMING SOON</div>
                <div>3. NAPOLI - COMING SOON</div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs;
