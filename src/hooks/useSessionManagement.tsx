
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";

export const useSessionManagement = () => {
  const { toast } = useToast();
  const { isLoggedIn, logout } = useUser();

  // Auto-logout after 24 hours
  useEffect(() => {
    if (isLoggedIn) {
      const loginTime = localStorage.getItem("userLoginTime");
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - loginTimestamp > twentyFourHours) {
          logout();
          toast({
            title: "SESSIONE SCADUTA",
            description: "Sei stato disconnesso automaticamente dopo 24 ore",
            variant: "destructive"
          });
        } else {
          const remainingTime = twentyFourHours - (now - loginTimestamp);
          const timeoutId = setTimeout(() => {
            logout();
            toast({
              title: "SESSIONE SCADUTA",
              description: "Sei stato disconnesso automaticamente dopo 24 ore",
              variant: "destructive"
            });
          }, remainingTime);
          
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [isLoggedIn, logout, toast]);
};
