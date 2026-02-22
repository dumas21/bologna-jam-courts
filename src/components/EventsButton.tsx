
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';

const EventsButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/events')}
      className="w-full mb-8 flex items-center justify-between gap-4 px-5 py-4 rounded-xl border-2 border-yellow-500/40 bg-gradient-to-r from-purple-900/40 to-pink-900/30 backdrop-blur-sm hover:border-yellow-400/70 transition-all group"
    >
      <div className="flex items-center gap-3">
        <Calendar size={20} className="text-yellow-400 flex-shrink-0" />
        <span
          className="text-yellow-300"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px", textShadow: "1px 1px 0px #000" }}
        >
          PRESTO NUOVI EVENTI
        </span>
      </div>
      <ChevronRight size={16} className="text-yellow-400/60 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default EventsButton;
