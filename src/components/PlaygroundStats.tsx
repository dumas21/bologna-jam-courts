
import { Clock, Star, Signpost } from "lucide-react";
import { Playground } from "@/types/playground";

interface PlaygroundStatsProps {
  playground: Playground;
}

const PlaygroundStats = ({ playground }: PlaygroundStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
      <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
        <Signpost size={12} className="text-cyan-400 mr-2 flex-shrink-0" />
        <span className="text-white/90 nike-text truncate">{playground.address}</span>
      </div>
      
      <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
        <Clock size={12} className="text-blue-400 mr-2 flex-shrink-0" />
        <span className="text-white/90 nike-text">{playground.openHours}</span>
      </div>
      
      <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
        <span className="text-yellow-400 mr-2">🏀</span>
        <span className="text-white/90 nike-text font-bold">CANESTRI: {playground.basketCount || 2}</span>
      </div>
      
      <div className="flex items-center bg-black bg-opacity-70 px-3 py-2 rounded-lg border border-orange-300">
        <Star size={12} className="text-yellow-400 mr-2 flex-shrink-0" />
        <span className="text-white/90 nike-text">{playground.rating?.toFixed(1)} ({playground.ratingCount})</span>
      </div>
    </div>
  );
};

export default PlaygroundStats;
