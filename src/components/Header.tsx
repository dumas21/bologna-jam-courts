
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

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
        playPromise.catch(() => {
          // Silently handle audio errors
        });
      }
    } catch {
      // Silently handle audio initialization errors
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

  const handleLogout = () => {
    playSoundEffect('click');
    navigate('/logout');
  };

  return (
    <header className="bg-black bg-opacity-80 border-b-4 border-white p-4 relative z-20">
      <div className="container mx-auto flex flex-col items-center gap-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex-1"></div>
          
          <div 
            className="cursor-pointer select-none flex-1 flex justify-center"
            onClick={handleHomeClick}
          >
            <img 
              src="/lovable-uploads/e4d6bab9-96f0-4ad5-a830-7af99d4433b5.png" 
              alt="Playground Jam Bologna Logo"
              className="h-32 md:h-40 lg:h-48 xl:h-56 w-auto object-contain arcade-icon"
              onError={() => {
                // Fallback handling if needed
              }}
            />
          </div>

          <div className="flex-1 flex justify-end">
            {isAuthenticated ? (
              <div className="flex flex-col items-end gap-2">
                <div className="text-white text-xs nike-text">
                  {profile?.nickname || profile?.username || 'Utente'}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-black transition-colors nike-text text-xs"
                >
                  LOGOUT
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-black transition-colors nike-text text-xs"
              >
                LOGIN
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
