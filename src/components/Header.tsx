
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const handleHomeClick = () => {
    playSoundEffect('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <header className="bg-black bg-opacity-80 border-b-4 border-white p-4 relative z-20">
      <div className="container mx-auto flex flex-col items-center gap-4">
        <div 
          className="cursor-pointer select-none"
          onClick={handleHomeClick}
        >
          <img 
            src="/lovable-uploads/e4d6bab9-96f0-4ad5-a830-7af99d4433b5.png" 
            alt="Playground Jam Bologna Logo"
            className="h-32 md:h-40 lg:h-48 xl:h-56 w-auto object-contain arcade-icon"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
