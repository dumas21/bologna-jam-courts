
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const playSoundEffect = (action: string) => {
    try {
      // Check if audio is supported
      if (typeof Audio === 'undefined') {
        return;
      }

      const audio = new Audio(`/sounds/${action}.mp3`);
      audio.volume = 0.3;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Silently handle audio errors to prevent console spam
          console.log('Audio playback not available');
        });
      }
    } catch (error) {
      // Silently handle audio initialization errors
      console.log('Audio not available');
    }
  };

  const handleHomeClick = () => {
    try {
      playSoundEffect('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error in home navigation:', error);
      // Fallback navigation without sound
      if (window.location.pathname !== '/') {
        navigate('/');
      }
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
            onError={(e) => {
              console.log('Logo image failed to load');
              // Fallback handling if needed
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
