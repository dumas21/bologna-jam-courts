
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, nickname, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast({
      title: "LOGOUT EFFETTUATO",
      description: "Sei stato disconnesso con successo",
    });
    
    const audio = new Audio('/sounds/logout.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  return (
    <header className="bg-black bg-opacity-80 border-b-4 border-white p-4 relative z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="arcade-title text-lg cursor-pointer"
          onClick={() => {
            playSoundEffect('click');
            navigate('/');
          }}
        >
          PLAYGROUND JAM BOLOGNA
        </div>
        
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Button 
              onClick={() => {
                playSoundEffect('click');
                navigate('/login');
              }}
              className="arcade-button arcade-button-primary"
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
                className="arcade-button arcade-button-primary"
              >
                <User size={16} className="mr-2" />
                {nickname}
              </Button>
              
              {showUserMenu && (
                <Card className="absolute right-0 top-full mt-2 w-48 z-50 arcade-card">
                  <CardContent className="p-2">
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          playSoundEffect('click');
                          navigate('/admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full justify-start arcade-button arcade-button-stats"
                      >
                        <Settings size={16} className="mr-2" />
                        ADMIN
                      </Button>
                      <Button 
                        onClick={handleLogout}
                        className="w-full justify-start arcade-button arcade-button-danger"
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
    </header>
  );
};

export default Header;
