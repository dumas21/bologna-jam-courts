
import React from 'react';

interface EventBannerProps {
  playgroundId: string;
}

const EventBanner: React.FC<EventBannerProps> = ({ playgroundId }) => {
  // Only show for Giardini Margherita (id "1")
  if (playgroundId !== "1") {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-lg border-3 border-white shadow-xl transform hover:scale-105 transition-transform">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl animate-pulse">🏆</span>
          <span 
            className="text-white font-bold text-lg md:text-xl animate-pulse"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              textShadow: "3px 3px 0px #000, 0 0 15px #FFD700",
              letterSpacing: "2px"
            }}
          >
            EVENTO IN CORSO
          </span>
          <span className="text-3xl animate-pulse">🏆</span>
        </div>
        <div 
          className="text-yellow-300 font-bold text-sm md:text-base"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            textShadow: "2px 2px 0px #000",
            letterSpacing: "1px"
          }}
        >
          TORNEO STREETBALL 3VS3
        </div>
        <div className="mt-2 text-white text-xs font-bold bg-black bg-opacity-50 px-3 py-1 rounded-full inline-block">
          CLICCA PER MAGGIORI INFO
        </div>
      </div>
    </div>
  );
};

export default EventBanner;
