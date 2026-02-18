import { useState } from "react";
import { Playground } from "@/types/playground";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useRatings } from "@/hooks/useRatings";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import CheckInButton from "./CheckInButton";
import RatingForm from "./RatingForm";
import PlaygroundDetail from "./PlaygroundDetail";
import { MapPin, Star, Clock, Heart, Zap, Trophy, ChevronDown, ChevronUp, Users } from "lucide-react";

const PLAYGROUND_NICKNAMES: Record<string, { nickname: string; status: "iconic" | "active" }> = {
  "1":  { nickname: "I Giardini", status: "iconic" },
  "2":  { nickname: "Nanetti", status: "active" },
  "3":  { nickname: "Nicholas Green", status: "active" },
  "4":  { nickname: "I Regaz di Fava", status: "iconic" },
  "5":  { nickname: "Villa Angeletti", status: "active" },
  "6":  { nickname: "La Zucca", status: "active" },
  "7":  { nickname: "Pertini", status: "active" },
  "8":  { nickname: "Guercino", status: "active" },
  "9":  { nickname: "Lunetta", status: "active" },
  "10": { nickname: "Campo Savena", status: "active" },
  "11": { nickname: "San Donnino", status: "active" },
  "12": { nickname: "Lungosavena", status: "active" },
  "13": { nickname: "Libia / Il Ponte", status: "iconic" },
  "14": { nickname: "San Pellegrino", status: "active" },
  "15": { nickname: "Baden Powell", status: "active" },
};

const FEATURE_TAGS: Record<string, { label: string; color: string }> = {
  hasLighting:  { label: "💡 ILLUMINATO", color: "bg-yellow-900/60 border-yellow-500 text-yellow-300" },
  hasShade:     { label: "🌳 OMBRA",      color: "bg-green-900/60 border-green-500 text-green-300"   },
  hasAmenities: { label: "🚿 SERVIZI",    color: "bg-blue-900/60 border-blue-500 text-blue-300"     },
  hasFountain:  { label: "💧 FONTANA",    color: "bg-cyan-900/60 border-cyan-500 text-cyan-300"     },
};

interface PlaygroundListProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
  onCheckIn: (playgroundId: string, userNickname: string) => boolean;
  onCheckOut: (playgroundId: string, userNickname: string) => boolean;
  hasUserCheckedIn: (playgroundId: string, userNickname: string) => boolean;
  checkInRecords: { [playgroundId: string]: string[] };
  onRatingUpdate: (playgroundId: string, newRating: number, newRatingCount: number) => void;
}

const PlaygroundList = ({
  playgrounds,
  selectedPlayground,
  onSelectPlayground,
  onCheckIn,
  onCheckOut,
  hasUserCheckedIn,
  checkInRecords,
  onRatingUpdate,
}: PlaygroundListProps) => {
  const { isAuthenticated } = useAuth();
  const { checkIn, checkOut, userActiveCheckIn, isLoading: checkInLoading, getPlayerCount, getFieldStatus } = useCheckIn();
  const { submitRating, getRating } = useRatings();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingPlaygroundId, setRatingPlaygroundId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterZone, setFilterZone] = useState("tutti");

  const handleCheckOut = async () => {
    const playgroundId = await checkOut();
    if (playgroundId) {
      setRatingPlaygroundId(playgroundId as string);
      setShowRatingForm(true);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
    const pg = playgrounds.find(p => p.id === id);
    if (pg) onSelectPlayground(pg);
  };

  const zones = ["tutti", ...Array.from(new Set(playgrounds.map(p => p.district || "altro")))];

  const filtered = playgrounds.filter(pg => {
    const info = PLAYGROUND_NICKNAMES[pg.id];
    const matchSearch =
      pg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (info?.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchZone = filterZone === "tutti" || pg.district === filterZone;
    return matchSearch && matchZone;
  });

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <div className="bg-black/80 border-2 border-orange-500 rounded-xl p-3 space-y-3">
        <input
          type="text"
          placeholder="🔍 CERCA CAMPO..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-black/70 border-2 border-orange-500/50 rounded-lg px-3 py-2 text-orange-300 placeholder-orange-800 focus:outline-none focus:border-orange-400"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px" }}
        />
        <div className="flex gap-2 flex-wrap">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              className={`px-3 py-1 rounded-lg border transition-all ${
                filterZone === zone
                  ? "border-orange-500 bg-orange-500/20 text-orange-300"
                  : "border-white/20 text-white/40 hover:border-white/40"
              }`}
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px" }}
            >
              {zone.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-orange-400/50" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px" }}>
          {filtered.length} CAMPI TROVATI
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map(playground => {
          const info = PLAYGROUND_NICKNAMES[playground.id];
          const isIconic = info?.status === "iconic";
          const isExpanded = expandedId === playground.id;
          const playerCount = getPlayerCount(playground.id);
          const fieldStatus = getFieldStatus(playground.id);
          const ratingData = getRating(playground.id);
          const displayRating = ratingData ? ratingData.average : playground.rating;
          const isUserHere = userActiveCheckIn?.playground_id === playground.id;

          return (
            <div
              key={playground.id}
              className={`rounded-xl overflow-hidden border-2 transition-all duration-300 bg-black/80 backdrop-blur-sm ${
                isExpanded
                  ? "border-orange-500 shadow-lg shadow-orange-500/30"
                  : isIconic
                  ? "border-yellow-500/60 hover:border-yellow-400"
                  : "border-orange-500/40 hover:border-orange-500/60"
              }`}
            >
              {/* Header cliccabile */}
              <button className="w-full text-left p-4" onClick={() => toggleExpand(playground.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {isIconic && (
                      <div className="flex items-center gap-1 mb-1">
                        <Trophy size={9} className="text-yellow-400" />
                        <span className="text-yellow-400" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "6px" }}>
                          LEGGENDARIO
                        </span>
                      </div>
                    )}
                    <h3
                      className="text-orange-400 truncate"
                      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "10px", textShadow: "0 0 8px rgba(255,107,53,0.5)" }}
                    >
                      {playground.name.toUpperCase()}
                    </h3>
                    {info?.nickname && (
                      <p className="text-yellow-400/60 mt-0.5" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px" }}>
                        "{info.nickname}"
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin size={9} className="text-white/30 flex-shrink-0" />
                      <span className="text-white/30 font-mono truncate" style={{ fontSize: "8px" }}>
                        {playground.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {displayRating != null && (
                      <div className="flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px" }}>
                          {displayRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {playerCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Zap size={9} className="text-green-400" />
                        <span className={fieldStatus.color} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px" }}>
                          {playerCount}🏀
                        </span>
                      </div>
                    )}
                    <div className="text-white/25 mt-0.5">
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </div>
                  </div>
                </div>

                {/* Tags & orario */}
                <div className="flex flex-wrap gap-1 mt-2 items-center">
                  <div className="flex items-center gap-1 mr-1">
                    <Clock size={8} className="text-white/25" />
                    <span className="text-white/25 font-mono" style={{ fontSize: "7px" }}>{playground.openHours}</span>
                  </div>
                  {Object.entries(FEATURE_TAGS).map(([key, tag]) =>
                    playground[key as keyof Playground] ? (
                      <span key={key} className={`px-1.5 py-0.5 rounded border font-mono ${tag.color}`} style={{ fontSize: "6px" }}>
                        {tag.label}
                      </span>
                    ) : null
                  )}
                </div>
              </button>

              {/* Sezione espansa */}
              {isExpanded && (
                <div className="border-t-2 border-orange-500/30 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/50 rounded-lg p-3 border border-orange-500/20">
                    <div>
                      <p className={fieldStatus.color} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px" }}>
                        {fieldStatus.label}
                      </p>
                      {playerCount > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users size={9} className="text-white/30" />
                          <span className="text-white/30 font-mono" style={{ fontSize: "7px" }}>{playerCount} giocatori ora</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAuthenticated && (
                        <button onClick={() => toggleFavorite(playground.id)} className="p-2 rounded-full border border-white/20 hover:border-red-400 transition-colors">
                          <Heart size={14} className={isFavorite(playground.id) ? "fill-red-500 text-red-500" : "text-white/30"} />
                        </button>
                      )}
                      <CheckInButton
                        playgroundId={playground.id}
                        playerCount={playerCount}
                        fieldStatus={fieldStatus}
                        isUserHere={isUserHere}
                        isLoading={checkInLoading}
                        onCheckIn={() => checkIn(playground.id)}
                        onCheckOut={handleCheckOut}
                      />
                    </div>
                  </div>

                  {showRatingForm && ratingPlaygroundId === playground.id && (
                    <RatingForm
                      playgroundId={playground.id}
                      onSubmit={submitRating}
                      onClose={() => { setShowRatingForm(false); setRatingPlaygroundId(null); }}
                    />
                  )}

                  <div data-playground-details>
                    <PlaygroundDetail
                      playground={playground}
                      onCheckIn={onCheckIn}
                      onCheckOut={onCheckOut}
                      hasUserCheckedIn={hasUserCheckedIn}
                      checkInRecords={checkInRecords}
                      onRatingUpdate={onRatingUpdate}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaygroundList;

