
import { Button } from "@/components/ui/button";
import { Calendar, Home, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationButtonsProps {
  onScrollToTop: () => void;
  playSoundEffect: (action: string) => void;
}

const NavigationButtons = ({ onScrollToTop, playSoundEffect }: NavigationButtonsProps) => {
  const navigate = useNavigate();

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
    </div>
  );
};

export default NavigationButtons;
