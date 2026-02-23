import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.pathname !== '/') navigate('/');
  };

  return (
    <header className="border-b border-white/10 bg-black/60 backdrop-blur-md relative z-20">
      <div className="container mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
        {/* Logo — smaller, cleaner */}
        <div className="cursor-pointer select-none" onClick={handleHomeClick}>
          <img
            src="/lovable-uploads/e4d6bab9-96f0-4ad5-a830-7af99d4433b5.png"
            alt="Playground Jam Bologna Logo"
            className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,107,53,0.4)]"
          />
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:border-orange-500/60 transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px" }}
              >
                <User size={12} />
                {profile?.nickname || profile?.username || 'Utente'}
              </button>
              <button
                onClick={() => navigate('/logout')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:border-red-500/60 transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px" }}
              >
                <LogOut size={12} />
              </button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              size="sm"
              className="border-white/30 hover:border-orange-500 hover:bg-orange-500/10 transition-all"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px" }}
            >
              LOGIN
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
