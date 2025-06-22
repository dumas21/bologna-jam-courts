
import { Users, Lightbulb, Signpost } from "lucide-react";
import { Playground } from "@/types/playground";

interface PlaygroundControlsProps {
  playground: Playground;
  onMapsClick: (address: string, e: React.MouseEvent) => void;
}

const PlaygroundControls = ({ playground, onMapsClick }: PlaygroundControlsProps) => {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
      <div className="flex items-center bg-black bg-opacity-90 px-3 py-2 rounded-full border-2 border-orange-500 min-w-[60px]">
        <Users size={14} className="text-red-500 mr-2 flex-shrink-0" />
        <span className="text-sm font-bold nike-text text-white">{playground.currentPlayers}</span>
      </div>
      
      {playground.hasLighting && (
        <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-full border border-yellow-400">
          <Lightbulb size={16} className="text-yellow-400 animate-pulse" />
        </div>
      )}
      
      {/* Pulsante Maps con cartello stradale INGRANDITO */}
      <button 
        className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-400 rounded-full border-4 border-white shadow-xl hover:shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation retro-neon-glow"
        onClick={(e) => onMapsClick(playground.address, e)}
        title="Apri in Google Maps"
        style={{
          boxShadow: '0 0 25px #00ffff, inset 0 0 25px rgba(255,255,255,0.2)'
        }}
      >
        <Signpost size={40} className="drop-shadow-xl text-white" />
      </button>
    </div>
  );
};

export default PlaygroundControls;
