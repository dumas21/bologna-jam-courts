
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const EventsButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio error:', err));
    navigate('/events');
  };

  return (
    <div 
      className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-6 rounded-xl border-4 border-yellow-400 cursor-pointer transform hover:scale-105 transition-transform text-center my-6"
      onClick={handleClick}
      style={{
        animation: 'pulse 2s ease-in-out infinite',
        boxShadow: '0 0 30px #FF00FF, 0 0 60px #FF0000'
      }}
    >
      <div className="flex items-center justify-center gap-4 mb-3">
        <Calendar size={40} className="text-yellow-300 animate-bounce" />
        <span 
          className="text-yellow-300 font-bold text-2xl md:text-3xl animate-pulse"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            textShadow: "3px 3px 0px #000, 0 0 15px #FFD700",
            letterSpacing: "3px"
          }}
        >
          PRESTO NUOVI EVENTI
        </span>
        <Calendar size={40} className="text-yellow-300 animate-bounce" />
      </div>
      <div className="text-white text-sm font-bold bg-black bg-opacity-70 px-4 py-2 rounded-full inline-block border-2 border-yellow-400 animate-pulse">
        CLICCA PER VEDERE TUTTI GLI EVENTI
      </div>
    </div>
  );
};

export default EventsButton;
