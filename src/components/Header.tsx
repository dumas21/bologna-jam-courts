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
    <header className="relative border-b-2 border-orange-500/40 bg-black/80 overflow-hidden z-20">
      {/* Logo ingrandito come sfondo del banner */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <img
          src="/lovable-uploads/e4d6bab9-96f0-4ad5-a830-7af99d4433b5.png"
          alt=""
          className="w-[160%] max-w-none object-contain opacity-25 blur-[1.5px] drop-shadow-[0_0_40px_rgba(255,107,53,0.5)]"
        />
      </div>
      {/* Velature per la leggibilità */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/80 pointer-events-none" aria-hidden="true" />

      {/* Contenuto del banner */}
      <div className="relative container mx-auto max-w-4xl px-4 pt-6 pb-8 md:pt-8 md:pb-10">
        {/* Logo principale, molto più grande */}
        <div className="flex justify-center cursor-pointer select-none" onClick={handleHomeClick}>
          <img
            src="/lovable-uploads/e4d6bab9-96f0-4ad5-a830-7af99d4433b5.png"
            alt="Playground Jam Bologna Logo"
            className="h-56 md:h-80 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,107,53,0.7)]"
          />
        </div>

        {/* Azioni autenticazione in alto a destra */}
        <div className="absolute top-3 right-4 flex items-center gap-2 z-10">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-black/60 hover:border-orange-500/60 transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px" }}
              >
                <User size={12} />
                {profile?.nickname || profile?.username || 'Utente'}
              </button>
              <button
                onClick={() => navigate('/logout')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-black/60 hover:border-red-500/60 transition-colors"
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
              className="border-white/30 bg-black/60 hover:border-orange-500 hover:bg-orange-500/10 transition-all"
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
