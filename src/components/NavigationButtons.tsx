
import { Button } from "@/components/ui/button";
import { Calendar, Home, LogIn, UserPlus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavigationButtonsProps {
  onScrollToTop: () => void;
  playSoundEffect: (action: string) => void;
}

const NavigationButtons = ({ onScrollToTop, playSoundEffect }: NavigationButtonsProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  const handleLogout = async () => {
    playSoundEffect('click');
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
      <Button 
        onClick={onScrollToTop}
        className="arcade-button arcade-button-home text-xs px-2 py-2 md:px-4 md:py-3"
      >
        <Home size={14} />
        <span className="hidden sm:inline ml-1">HOME</span>
      </Button>
      
      <Button 
        onClick={() => {
          playSoundEffect('click');
          navigate('/events');
        }}
        className="arcade-button arcade-button-stats text-xs px-2 py-2 md:px-4 md:py-3"
      >
        <Calendar size={14} />
        <span className="hidden sm:inline ml-1">EVENTI</span>
      </Button>

      {/* Mostra bottoni LOGIN/REGISTRATI solo se non autenticato */}
      {!isAuthenticated ? (
        <>
          <Button 
            onClick={() => {
              playSoundEffect('click');
              navigate('/register');
            }}
            className="arcade-button arcade-button-stats text-xs px-2 py-2 md:px-4 md:py-3"
          >
            <UserPlus size={14} />
            <span className="hidden sm:inline ml-1">REGISTRATI</span>
          </Button>

          <Button 
            onClick={() => {
              playSoundEffect('click');
              navigate('/login');
            }}
            className="arcade-button arcade-button-stats text-xs px-2 py-2 md:px-4 md:py-3"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline ml-1">LOGIN</span>
          </Button>
        </>
      ) : (
        // Mostra bottone LOGOUT se autenticato
        <Button 
          onClick={handleLogout}
          className="arcade-button arcade-button-stats text-xs px-2 py-2 md:px-4 md:py-3"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline ml-1">LOGOUT</span>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
