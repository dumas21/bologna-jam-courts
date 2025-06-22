
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
    <div className="mb-10 p-12 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl border-8 border-white shadow-2xl transform hover:scale-105 transition-transform animate-pulse">
      <div className="text-center">
        <div className="flex items-center justify-center gap-6 mb-6">
          <span className="text-8xl animate-bounce">🏆</span>
          <span 
            className="text-white font-bold text-3xl md:text-6xl animate-pulse"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              textShadow: "6px 6px 0px #000, 0 0 30px #FFD700, 0 0 60px #FF0000",
              letterSpacing: "6px"
            }}
          >
            EVENTO IN CORSO
          </span>
          <span className="text-8xl animate-bounce">🏆</span>
        </div>
        <div 
          className="text-yellow-300 font-bold text-2xl md:text-4xl mb-6"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            textShadow: "4px 4px 0px #000, 0 0 20px #FFFF00",
            letterSpacing: "4px"
          }}
        >
          TORNEO STREETBALL 3VS3
        </div>
        <div className="mt-6 text-white text-xl font-bold bg-black bg-opacity-80 px-8 py-4 rounded-full inline-block border-4 border-yellow-400 animate-pulse">
          CLICCA PER MAGGIORI INFO
        </div>
      </div>
    </div>
  );
};

export default EventBanner;
