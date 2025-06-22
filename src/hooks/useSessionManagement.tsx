
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { validateSession, SECURITY_CONFIG } from "@/config/security";

export const useSessionManagement = () => {
  const { toast } = useToast();
  const { isLoggedIn, logout, refreshSession, sessionValid } = useUser();

  // Enhanced session management with automatic refresh
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkSession = () => {
      const sessionCheck = validateSession();
      
      if (!sessionCheck.isValid) {
        logout();
        toast({
          title: "SESSIONE SCADUTA",
          description: "Sei stato disconnesso automaticamente per sicurezza",
          variant: "destructive"
        });
        return;
      }

      if (sessionCheck.shouldRefresh) {
        refreshSession();
        console.log('Session automatically refreshed');
      }
    };

    // Check session immediately
    checkSession();

    // Set up periodic session checks every 5 minutes
    const sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000);

    // Set up automatic logout timer
    const loginTime = localStorage.getItem("userLoginTime");
    if (loginTime) {
      const loginTimestamp = parseInt(loginTime);
      const now = Date.now();
      const sessionTimeout = SECURITY_CONFIG.SESSION.TIMEOUT_HOURS * 60 * 60 * 1000;
      const remainingTime = sessionTimeout - (now - loginTimestamp);

      if (remainingTime > 0) {
        const timeoutId = setTimeout(() => {
          logout();
          toast({
            title: "SESSIONE SCADUTA",
            description: `Sei stato disconnesso automaticamente dopo ${SECURITY_CONFIG.SESSION.TIMEOUT_HOURS} ore`,
            variant: "destructive"
          });
        }, remainingTime);

        // Show warning 30 minutes before logout
        const warningTime = remainingTime - (30 * 60 * 1000);
        let warningTimeoutId: NodeJS.Timeout;
        
        if (warningTime > 0) {
          warningTimeoutId = setTimeout(() => {
            toast({
              title: "SESSIONE IN SCADENZA",
              description: "La tua sessione scadrà tra 30 minuti. Effettua un'azione per rinnovarla.",
              variant: "default"
            });
          }, warningTime);
        }

        return () => {
          clearTimeout(timeoutId);
          if (warningTimeoutId) clearTimeout(warningTimeoutId);
          clearInterval(sessionCheckInterval);
        };
      }
    }

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [isLoggedIn, logout, refreshSession, toast]);

  // Monitor for suspicious activity
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        // Refresh session when user returns to tab
        const sessionCheck = validateSession();
        if (sessionCheck.isValid && sessionCheck.shouldRefresh) {
          refreshSession();
        } else if (!sessionCheck.isValid) {
          logout();
          toast({
            title: "SESSIONE INVALIDATA",
            description: "La sessione è stata invalidata per motivi di sicurezza",
            variant: "destructive"
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn, logout, refreshSession, toast]);

  // Display security status if session is invalid
  useEffect(() => {
    if (isLoggedIn && !sessionValid) {
      toast({
        title: "ATTENZIONE SICUREZZA",
        description: "La tua sessione presenta anomalie. Effettua di nuovo il login.",
        variant: "destructive"
      });
      logout();
    }
  }, [sessionValid, isLoggedIn, logout, toast]);
};
