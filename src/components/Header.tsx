
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Shield } from "lucide-react";
import { useSupabaseUser } from "@/contexts/SupabaseUserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, nickname, isAdmin, signOut } = useSupabaseUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
    
    const audio = new Audio('/sounds/logout.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playbook error:', err));
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
        
        <div className="w-full flex justify-between items-center">
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <Button 
                onClick={() => {
                  playSoundEffect('click');
                  navigate('/login');
                }}
                className="arcade-button arcade-button-primary arcade-text"
              >
                <User size={16} className="mr-2" />
                LOGIN
              </Button>
            ) : (
              <div className="relative">
                <Button 
                  onClick={() => {
                    playSoundEffect('click');
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="arcade-button arcade-button-primary arcade-text"
                >
                  <User size={16} className="mr-2" />
                  {nickname}
                  {isAdmin && <Shield size={14} className="ml-2 text-yellow-400" />}
                </Button>
                
                {showUserMenu && (
                  <Card className="absolute right-0 top-full mt-2 w-48 z-50 arcade-card">
                    <CardContent className="p-2">
                      <div className="space-y-2">
                        {isAdmin && (
                          <Button
                            onClick={() => {
                              playSoundEffect('click');
                              navigate('/admin/users');
                              setShowUserMenu(false);
                            }}
                            className="w-full justify-start arcade-button arcade-button-secondary arcade-text"
                          >
                            <Shield size={16} className="mr-2" />
                            GESTIONE UTENTI
                          </Button>
                        )}
                        
                        <Button 
                          onClick={handleLogout}
                          className="w-full justify-start arcade-button arcade-button-danger arcade-text"
                        >
                          <LogOut size={16} className="mr-2" />
                          LOGOUT
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
