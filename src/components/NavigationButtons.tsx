
import { Calendar, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavigationButtonsProps {
  onScrollToTop: () => void;
  playSoundEffect: (action: string) => void;
}

const NavigationButtons = ({ onScrollToTop, playSoundEffect }: NavigationButtonsProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const btnClass = "flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all";
  const textStyle = { fontFamily: "'Press Start 2P', monospace", fontSize: "7px" } as const;

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      <button
        onClick={() => { playSoundEffect('click'); navigate('/events'); }}
        className={btnClass}
        style={textStyle}
      >
        <Calendar size={12} />
        <span>EVENTI</span>
      </button>

      {!isAuthenticated && (
        <button
          onClick={() => { playSoundEffect('click'); navigate('/register'); }}
          className={btnClass}
          style={textStyle}
        >
          <UserPlus size={12} />
          <span>REGISTRATI</span>
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;
