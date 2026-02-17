import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const MotivationalPopup: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [prevAuth, setPrevAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (prevAuth === null) {
      setPrevAuth(isAuthenticated);
      return;
    }

    if (!prevAuth && isAuthenticated) {
      setShowLogin(true);
    }
    if (prevAuth && !isAuthenticated) {
      setShowLogout(true);
    }

    setPrevAuth(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <>
      {/* LOGIN popup */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="bg-black border-2 border-jam-neon-orange max-w-sm mx-auto" style={{ boxShadow: '0 0 30px rgba(255,107,53,0.5)' }}>
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="text-5xl block mb-3">🏀</span>
              <span className="font-press-start text-jam-neon-orange text-sm leading-relaxed">
                PORTA IL PALLONE<br />E RISPETTO
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-xs text-white/70 font-press-start leading-relaxed">
            BENVENUTO NELLA COMMUNITY!<br />GIOCA PULITO, DIVERTITI.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setShowLogin(false)}
              className="w-full arcade-button bg-jam-neon-orange hover:bg-orange-600 text-sm py-3"
            >
              HO CAPITO! 💪
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LOGOUT popup */}
      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="bg-black border-2 border-green-500 max-w-sm mx-auto" style={{ boxShadow: '0 0 30px rgba(34,197,94,0.4)' }}>
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="text-5xl block mb-3">🧹</span>
              <span className="font-press-start text-green-400 text-sm leading-relaxed">
                RICORDA DI<br />LASCIARE PULITO
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-xs text-white/70 font-press-start leading-relaxed">
            GRAZIE PER AVER GIOCATO!<br />RISPETTA IL CAMPO PER TUTTI.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setShowLogout(false)}
              className="w-full arcade-button bg-green-600 hover:bg-green-700 text-sm py-3"
            >
              HO CAPITO! ✅
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MotivationalPopup;
