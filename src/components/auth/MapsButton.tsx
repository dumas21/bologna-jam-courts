
import { Signpost } from "lucide-react";

const MapsButton = () => {
  const openGoogleMaps = () => {
    window.open('https://maps.google.com', '_blank');
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Maps sound error:', err));
  };

  return (
    <div className="text-center mt-4">
      <button 
        onClick={openGoogleMaps}
        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-400 rounded-full border-3 border-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation"
        title="Apri Google Maps"
        style={{
          boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(255,255,255,0.1)'
        }}
      >
        <Signpost size={32} className="drop-shadow-lg text-white" />
      </button>
    </div>
  );
};

export default MapsButton;
