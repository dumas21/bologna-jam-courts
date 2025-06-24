
import { Button } from "@/components/ui/button";

interface AuthToggleButtonProps {
  isSignUp: boolean;
  onToggle: () => void;
}

const AuthToggleButton = ({ isSignUp, onToggle }: AuthToggleButtonProps) => {
  return (
    <div className="text-center">
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        className="arcade-text"
        style={{ color: '#00ffff' }}
      >
        {isSignUp ? "Hai già un account? ACCEDI" : "Non hai un account? REGISTRATI"}
      </Button>
    </div>
  );
};

export default AuthToggleButton;
