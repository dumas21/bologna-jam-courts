
import React from 'react';

interface EventBannerProps {
  playgroundId: string;
}

const EventBanner: React.FC<EventBannerProps> = ({ playgroundId }) => {
  // Solo per Giardini Margherita (id "1")
  if (playgroundId !== "1") {
    return null;
  }

  return (
    <div className="mb-10 p-16 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-3xl border-8 border-white shadow-2xl transform hover:scale-105 transition-transform" 
         style={{
           animation: 'pulse 1s ease-in-out infinite',
           boxShadow: '0 0 50px #FF00FF, 0 0 100px #FF0000, inset 0 0 50px rgba(255,255,255,0.1)'
         }}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-8 mb-8">
          <span className="text-10xl animate-bounce">🏆</span>
          <span 
            className="text-white font-bold text-4xl md:text-8xl animate-pulse"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              textShadow: "8px 8px 0px #000, 0 0 40px #FFD700, 0 0 80px #FF0000",
              letterSpacing: "8px"
            }}
          >
            EVENTO IN CORSO
          </span>
          <span className="text-10xl animate-bounce">🏆</span>
        </div>
        <div 
          className="text-yellow-300 font-bold text-3xl md:text-5xl mb-8"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            textShadow: "6px 6px 0px #000, 0 0 30px #FFFF00",
            letterSpacing: "6px"
          }}
        >
          TORNEO STREETBALL 3VS3
        </div>
        <div className="mt-8 text-white text-2xl font-bold bg-black bg-opacity-90 px-12 py-6 rounded-full inline-block border-6 border-yellow-400" 
             style={{
               animation: 'pulse 1.5s ease-in-out infinite',
               boxShadow: '0 0 30px #FFFF00'
             }}>
          CLICCA PER MAGGIORI INFO
        </div>
      </div>
    </div>
  );
};

export default EventBanner;
