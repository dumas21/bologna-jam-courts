import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import { Playground } from "@/types/playground";
import CheckInButton from "./CheckInButton";
import RatingForm from "./RatingForm";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useRatings } from "@/hooks/useRatings";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  const { isAuthenticated } = useAuth();
  const { checkIn, checkOut, userActiveCheckIn, isLoading: checkInLoading, getPlayerCount, getFieldStatus } = useCheckIn();
  const { submitRating, getRating } = useRatings();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingPlaygroundId, setRatingPlaygroundId] = useState<string | null>(null);

  const handleTabClick = () => {
    playSoundEffect('tab');
    scrollToTop();
  };

  const handleCheckOut = async () => {
    const playgroundId = await checkOut();
    if (playgroundId) {
      setRatingPlaygroundId(playgroundId as string);
      setShowRatingForm(true);
    }
  };

  const getRatingAvg = (id: string): number | null => {
    const r = getRating(id);
    return r ? r.average : null;
  };

  return (
    <Tabs defaultValue="map" className="w-full arcade-main-tabs">
      <TabsList className="w-full grid grid-cols-2 mb-2 md:mb-4 arcade-main-tab-list h-auto">
        <TabsTrigger
          value="map"
          className="text-xs md:text-sm arcade-main-tab py-3 px-2"
          onClick={handleTabClick}
        >
          <span className="hidden sm:inline">MAPPA</span>
          <span className="inline sm:hidden">MAP</span>
        </TabsTrigger>
        <TabsTrigger
          value="playground"
          className="text-xs md:text-sm arcade-main-tab py-3 px-2"
          onClick={handleTabClick}
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
            getPlayerCount={getPlayerCount}
            getFieldStatus={getFieldStatus}
            getRatingAvg={getRatingAvg}
          />
        </div>

        {selectedPlayground && (
          <div className="mt-4 space-y-4" data-playground-details>
            {/* Real-time check-in section */}
            <div className="bg-black bg-opacity-80 border-2 border-jam-neon-orange rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-press-start text-xs text-jam-neon-orange mb-1">{selectedPlayground.name}</h3>
                <p className="text-[8px] text-white/50">{selectedPlayground.address}</p>
                {/* Rating display */}
                {getRating(selectedPlayground.id) && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-press-start">
                      {getRating(selectedPlayground.id)!.average.toFixed(1)}
                    </span>
                    <span className="text-[8px] text-white/40">
                      ({getRating(selectedPlayground.id)!.count} voti)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isAuthenticated && (
                  <button
                    onClick={() => toggleFavorite(selectedPlayground.id)}
                    className="p-2 rounded-full border border-white/20 hover:border-red-400 transition-colors"
                  >
                    <Heart
                      size={18}
                      className={isFavorite(selectedPlayground.id) ? 'fill-red-500 text-red-500' : 'text-white/40'}
                    />
                  </button>
                )}
                <CheckInButton
                  playgroundId={selectedPlayground.id}
                  playerCount={getPlayerCount(selectedPlayground.id)}
                  fieldStatus={getFieldStatus(selectedPlayground.id)}
                  isUserHere={userActiveCheckIn?.playground_id === selectedPlayground.id}
                  isLoading={checkInLoading}
                  onCheckIn={() => checkIn(selectedPlayground.id)}
                  onCheckOut={handleCheckOut}
                />
              </div>
            </div>

            {/* Rating form after check-out */}
            {showRatingForm && ratingPlaygroundId === selectedPlayground.id && (
              <RatingForm
                playgroundId={selectedPlayground.id}
                onSubmit={submitRating}
                onClose={() => { setShowRatingForm(false); setRatingPlaygroundId(null); }}
              />
            )}

            {/* Existing detail panel */}
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
            <h2 className="text-xl md:text-2xl arcade-heading text-jam-neon-orange">🏀 PLAYGROUND JAM ITALIA 🏀</h2>
            <p className="text-sm md:text-base arcade-text">
              STIAMO ESPANDENDO IN TUTTA ITALIA! PRESTO DISPONIBILI NUOVE CITTÀ
            </p>

            <div className="arcade-mini-leaderboard bg-black bg-opacity-80 p-6 rounded-xl border-2 border-jam-neon-orange">
              <h3 className="text-lg md:text-xl mb-4 text-jam-yellow font-bold">🚀 PROSSIME CITTÀ:</h3>
              <div className="space-y-3 text-sm md:text-base">
                {[
                  { city: '🏛️ ROMA', gradient: 'from-red-600 to-orange-500' },
                  { city: '🏙️ MILANO', gradient: 'from-blue-600 to-cyan-500' },
                  { city: '🌋 NAPOLI', gradient: 'from-green-600 to-blue-500' },
                  { city: '🌊 GENOVA', gradient: 'from-purple-600 to-pink-500' },
                  { city: '🎭 FIRENZE', gradient: 'from-yellow-600 to-red-500' },
                ].map(item => (
                  <div key={item.city} className={`flex items-center justify-between p-3 bg-gradient-to-r ${item.gradient} rounded-lg`}>
                    <span className="font-bold">{item.city}</span>
                    <span className="text-jam-yellow">COMING SOON</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-xl border-2 border-jam-yellow">
              <h4 className="text-lg font-bold text-jam-yellow mb-2">🎯 VUOI LA TUA CITTÀ?</h4>
              <p className="text-sm mb-3">Contattaci per aggiungere la tua città al network!</p>
              <p className="text-xs text-jam-yellow">📧 playgroundjam21@gmail.com</p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs;
