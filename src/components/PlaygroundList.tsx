import { useState } from "react";
import { Playground } from "@/types/playground";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useRatings } from "@/hooks/useRatings";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import CheckInButton from "./CheckInButton";
import RatingForm from "./RatingForm";
import PlaygroundDetail from "./PlaygroundDetail";
import { MapPin, Star, Clock, Heart, Trophy, ChevronDown, ChevronUp, Users, Search, Navigation } from "lucide-react";
import { openSecureExternalLink } from "@/config/security";

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
  hasLighting:  { label: "💡 ILLUMINATO", color: "bg-yellow-900/40 border-yellow-600/40 text-yellow-400" },
  hasShade:     { label: "🌳 OMBRA",      color: "bg-green-900/40 border-green-600/40 text-green-400"   },
  hasAmenities: { label: "🚿 SERVIZI",    color: "bg-blue-900/40 border-blue-600/40 text-blue-400"     },
  hasFountain:  { label: "💧 FONTANA",    color: "bg-cyan-900/40 border-cyan-600/40 text-cyan-400"     },
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

  const openDirections = (playground: Playground, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${playground.latitude},${playground.longitude}`;
    openSecureExternalLink(url);
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
    <div className="w-full space-y-6">
      {/* Search & filters */}
      <div className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 md:p-6 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="CERCA CAMPO..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white/80 placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-colors"
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "10px" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              className={`px-4 py-2 rounded-xl border transition-all min-h-[40px] ${
                filterZone === zone
                  ? "border-orange-500/60 bg-orange-500/15 text-orange-400"
                  : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
              }`}
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px" }}
            >
              {zone.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-white/20" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px" }}>
          {filtered.length} CAMPI TROVATI
        </p>
      </div>

      {/* Playground cards — full width, larger */}
      <div className="w-full space-y-5">
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
              className={`w-full rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-black/50 backdrop-blur-sm ${
                isExpanded
                  ? "border-orange-500/70 shadow-xl shadow-orange-500/15"
                  : isIconic
                  ? "border-yellow-500/40 hover:border-yellow-500/60"
                  : "border-white/15 hover:border-white/25"
              }`}
            >
              {/* Clickable header */}
              <button className="w-full text-left p-6 md:p-8" onClick={() => toggleExpand(playground.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {isIconic && (
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy size={14} className="text-yellow-400" />
                        <span className="text-yellow-400" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px" }}>
                          LEGGENDARIO
                        </span>
                      </div>
                    )}
                    <h3
                      className="text-orange-400 leading-relaxed"
                      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "13px", textShadow: "0 0 10px rgba(255,107,53,0.3)" }}
                    >
                      {playground.name.toUpperCase()}
                    </h3>
                    {info?.nickname && (
                      <p className="text-white/35 mt-1.5" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px" }}>
                        "{info.nickname}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <MapPin size={14} className="text-white/25 flex-shrink-0" />
                      <span className="text-white/25 font-mono" style={{ fontSize: "10px" }}>
                        {playground.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {displayRating != null && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px" }}>
                          {displayRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {playerCount > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
                        <span className="text-green-400" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px" }}>
                          {playerCount} 🏀
                        </span>
                      </div>
                    )}
                    <div className="text-white/20 mt-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Tags & directions row */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <div className="flex items-center gap-1.5 mr-2">
                    <Clock size={11} className="text-white/20" />
                    <span className="text-white/20 font-mono" style={{ fontSize: "9px" }}>{playground.openHours}</span>
                  </div>
                  {Object.entries(FEATURE_TAGS).map(([key, tag]) =>
                    playground[key as keyof Playground] ? (
                      <span key={key} className={`px-2.5 py-1 rounded-lg border font-mono ${tag.color}`} style={{ fontSize: "7px" }}>
                        {tag.label}
                      </span>
                    ) : null
                  )}
                </div>

                {/* Directions button — always visible on card */}
                <div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 hover:border-blue-400/60 transition-all cursor-pointer min-h-[44px]"
                  onClick={(e) => openDirections(playground, e)}
                  role="link"
                  aria-label={`Indicazioni per ${playground.name}`}
                >
                  <Navigation size={16} className="text-blue-400" />
                  <span className="text-blue-300" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px" }}>
                    INDICAZIONI
                  </span>
                </div>
              </button>

              {/* Expanded section */}
              {isExpanded && (
                <div className="border-t border-white/10 p-6 md:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl p-5 border border-white/10 bg-white/5">
                    <div>
                      <p className={fieldStatus.color} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px" }}>
                        {fieldStatus.label}
                      </p>
                      {playerCount > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Users size={14} className="text-white/25" />
                          <span className="text-white/25 font-mono" style={{ fontSize: "9px" }}>{playerCount} giocatori ora</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isAuthenticated && (
                        <button
                          onClick={() => toggleFavorite(playground.id)}
                          className="p-3 rounded-xl border border-white/10 hover:border-red-400/50 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                          aria-label="Aggiungi ai preferiti"
                        >
                          <Heart size={18} className={isFavorite(playground.id) ? "fill-red-500 text-red-500" : "text-white/25"} />
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
