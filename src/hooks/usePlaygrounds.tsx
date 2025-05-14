
import { useState, useEffect } from "react";
import { Playground, playgroundData as initialData } from "@/types/playground";
import { getDailyResetTime } from "@/utils/timeUtils";
import { useToast } from "@/components/ui/use-toast";

export function usePlaygrounds() {
  const { toast } = useToast();
  const [playgrounds, setPlaygrounds] = useState<Playground[]>(() => {
    const saved = localStorage.getItem("playgroundData");
    if (saved) {
      return JSON.parse(saved);
    }
    return initialData;
  });
  
  const [totalCheckIns, setTotalCheckIns] = useState<number>(() => {
    return playgrounds.reduce((acc, pg) => acc + pg.totalCheckins, 0);
  });

  // Save playgrounds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("playgroundData", JSON.stringify(playgrounds));
    setTotalCheckIns(playgrounds.reduce((acc, pg) => acc + pg.totalCheckins, 0));
  }, [playgrounds]);
  
  // Set up daily reset timer
  useEffect(() => {
    const setupResetTimer = () => {
      const resetTime = getDailyResetTime();
      const timeUntilReset = resetTime.getTime() - new Date().getTime();
      
      const timerId = setTimeout(() => {
        resetDailyCounts();
        setupResetTimer(); // Set up the next day's timer
      }, timeUntilReset);
      
      return () => clearTimeout(timerId);
    };
    
    return setupResetTimer();
  }, []);
  
  // Reset all current player counts to zero
  const resetDailyCounts = () => {
    setPlaygrounds(current => 
      current.map(pg => ({ ...pg, currentPlayers: 0 }))
    );
    
    toast({
      title: "Contatori resettati",
      description: "Il conteggio giornaliero dei giocatori è stato azzerato.",
    });
  };
  
  // Player check-in to a playground
  const checkIn = (playgroundId: string) => {
    setPlaygrounds(current =>
      current.map(pg => {
        if (pg.id === playgroundId) {
          return { 
            ...pg, 
            currentPlayers: pg.currentPlayers + 1,
            totalCheckins: pg.totalCheckins + 1
          };
        }
        return pg;
      })
    );
  };
  
  // Player check-out from a playground
  const checkOut = (playgroundId: string) => {
    setPlaygrounds(current =>
      current.map(pg => {
        if (pg.id === playgroundId && pg.currentPlayers > 0) {
          return { ...pg, currentPlayers: pg.currentPlayers - 1 };
        }
        return pg;
      })
    );
  };
  
  return { 
    playgrounds, 
    totalCheckIns,
    checkIn, 
    checkOut,
    resetDailyCounts
  };
}
