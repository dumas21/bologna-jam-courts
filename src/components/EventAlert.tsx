
interface EventAlertProps {
  eventName: string;
  eventLink?: string;
  onClick?: () => void;
}

const EventAlert = ({ eventName, eventLink, onClick }: EventAlertProps) => {
  const handleClick = () => {
    if (eventLink) {
      window.open(eventLink, '_blank');
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg border-2 border-yellow-400 cursor-pointer transform hover:scale-105 transition-transform"
      onClick={handleClick}
      style={{
        animation: 'arcade-pulse 1.5s ease-in-out infinite'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-300 animate-pulse text-lg">🎯</span>
          <span className="text-xs font-bold text-yellow-300 animate-pulse">EVENTO IN CORSO</span>
        </div>
        <span className="text-yellow-300 text-xs">👆</span>
      </div>
      <div 
        className="text-white font-bold text-sm mt-1 hover:text-yellow-300 transition-colors"
        style={{ 
          fontFamily: "'Press Start 2P', monospace",
          animation: 'neon-glow 2s ease-in-out infinite'
        }}
      >
        {eventName.toUpperCase()}
      </div>
    </div>
  );
};

export default EventAlert;
