
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
    <div className="mb-8 p-8 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-xl border-4 border-white shadow-2xl transform hover:scale-105 transition-transform">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-5xl animate-pulse">🏆</span>
          <span 
            className="text-white font-bold text-2xl md:text-4xl animate-pulse"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              textShadow: "4px 4px 0px #000, 0 0 20px #FFD700",
              letterSpacing: "4px"
            }}
          >
            EVENTO IN CORSO
          </span>
          <span className="text-5xl animate-pulse">🏆</span>
        </div>
        <div 
          className="text-yellow-300 font-bold text-lg md:text-2xl mb-4"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            textShadow: "3px 3px 0px #000",
            letterSpacing: "2px"
          }}
        >
          TORNEO STREETBALL 3VS3
        </div>
        <div className="mt-4 text-white text-base font-bold bg-black bg-opacity-60 px-6 py-3 rounded-full inline-block border-2 border-yellow-400">
          CLICCA PER MAGGIORI INFO
        </div>
      </div>
    </div>
  );
};

export default EventBanner;
