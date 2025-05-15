
import { useState, useEffect } from "react";
import { Playground, playgroundData as initialData } from "@/types/playground";
import { getDailyResetTime } from "@/utils/timeUtils";
import { useToast } from "@/components/ui/use-toast";

// Aggiungiamo un'interfaccia per i check-in degli utenti
interface CheckInRecord {
  playgroundId: string;
  email: string;
  timestamp: number;
}

export function usePlaygrounds() {
  const { toast } = useToast();
  const [playgrounds, setPlaygrounds] = useState<Playground[]>(() => {
    const saved = localStorage.getItem("playgroundData");
    if (saved) {
      return JSON.parse(saved);
    }
    return initialData;
  });
  
  // Array per tenere traccia degli utenti che hanno fatto check-in
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem("checkInRecords");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });
  
  const [totalCheckIns, setTotalCheckIns] = useState<number>(() => {
    return playgrounds.reduce((acc, pg) => acc + pg.totalCheckins, 0);
  });

  // Save playgrounds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("playgroundData", JSON.stringify(playgrounds));
    setTotalCheckIns(playgrounds.reduce((acc, pg) => acc + pg.totalCheckins, 0));
  }, [playgrounds]);
  
  // Save check-in records
  useEffect(() => {
    localStorage.setItem("checkInRecords", JSON.stringify(checkInRecords));
  }, [checkInRecords]);
  
  // Set up daily reset timer per il reset alle 23:59
  useEffect(() => {
    const setupDailyResetTimer = () => {
      const now = new Date();
      const tonight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );
      const timeUntilReset = tonight.getTime() - now.getTime();
      
      const timerId = setTimeout(() => {
        resetDailyCounts();
        setupDailyResetTimer(); // Set up the next day's timer
      }, timeUntilReset);
      
      return () => clearTimeout(timerId);
    };
    
    return setupDailyResetTimer();
  }, []);
  
  // Set up chat reset timer (ogni 72 ore)
  useEffect(() => {
    const setupChatResetTimer = () => {
      // Check if we need to reset chats
      const lastChatReset = localStorage.getItem("lastChatReset");
      const now = Date.now();
      const threedays = 3 * 24 * 60 * 60 * 1000; // 72 hours in milliseconds
      
      if (!lastChatReset || now - Number(lastChatReset) > threedays) {
        // Reset comments dopo 72 ore
        resetChats();
        localStorage.setItem("lastChatReset", now.toString());
      }
      
      // Setup next timer
      const timeUntilReset = threedays - (now - (lastChatReset ? Number(lastChatReset) : now));
      const timerId = setTimeout(() => {
        resetChats();
        localStorage.setItem("lastChatReset", Date.now().toString());
        setupChatResetTimer(); // Set up the next timer
      }, timeUntilReset);
      
      return () => clearTimeout(timerId);
    };
    
    return setupChatResetTimer();
  }, []);
  
  // Reset all current player counts to zero alle 23:59
  const resetDailyCounts = () => {
    setPlaygrounds(current => 
      current.map(pg => ({ 
        ...pg, 
        currentPlayers: 0,
      }))
    );
    
    // Resetta anche i check-in records
    setCheckInRecords([]);
    
    // Play reset sound
    const audio = new Audio('/sounds/reset.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    toast({
      title: "Reset giornaliero",
      description: "I conteggi giornalieri sono stati azzerati e tutti gli utenti sono stati disconnessi.",
    });
  };
  
  // Reset chat ogni 72 ore
  const resetChats = () => {
    setPlaygrounds(current => 
      current.map(pg => ({ 
        ...pg, 
        comments: [],
      }))
    );
    
    // Play chat reset sound
    const audio = new Audio('/sounds/message.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    toast({
      title: "Reset chat",
      description: "Le chat dei playground sono state resettate dopo 72 ore.",
    });
  };
  
  // Player check-in to a playground with email
  const checkIn = (playgroundId: string, email: string) => {
    // Verifica se l'utente ha già fatto check-in in questo playground
    const existingRecord = checkInRecords.find(
      record => record.playgroundId === playgroundId && record.email === email
    );
    
    if (existingRecord) {
      toast({
        title: "Check-in già effettuato",
        description: "Hai già fatto il check-in in questo playground oggi.",
      });
      return false;
    }
    
    // Aggiungi il record di check-in
    setCheckInRecords(current => [
      ...current, 
      { playgroundId, email, timestamp: Date.now() }
    ]);
    
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
    
    return true;
  };
  
  // Player check-out from a playground
  const checkOut = (playgroundId: string, email: string) => {
    // Rimuovi il record di check-in
    const recordExists = checkInRecords.some(
      record => record.playgroundId === playgroundId && record.email === email
    );
    
    if (!recordExists) {
      toast({
        title: "Check-out non possibile",
        description: "Non hai fatto il check-in in questo playground.",
      });
      return false;
    }
    
    setCheckInRecords(current => 
      current.filter(
        record => !(record.playgroundId === playgroundId && record.email === email)
      )
    );
    
    setPlaygrounds(current =>
      current.map(pg => {
        if (pg.id === playgroundId && pg.currentPlayers > 0) {
          return { ...pg, currentPlayers: pg.currentPlayers - 1 };
        }
        return pg;
      })
    );
    
    return true;
  };
  
  // Funzione per aggiornare un playground esistente
  const updatePlayground = (updatedPlayground: Playground) => {
    setPlaygrounds(current =>
      current.map(pg => {
        if (pg.id === updatedPlayground.id) {
          return updatedPlayground;
        }
        return pg;
      })
    );
    
    toast({
      title: "Playground aggiornato",
      description: `${updatedPlayground.name} è stato aggiornato con successo.`,
    });
    
    // Play sound effect
    const audio = new Audio('/sounds/add.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    return true;
  };
  
  // Check if user has checked in
  const hasUserCheckedIn = (playgroundId: string, email: string) => {
    return checkInRecords.some(
      record => record.playgroundId === playgroundId && record.email === email
    );
  };
  
  return { 
    playgrounds, 
    totalCheckIns,
    checkIn, 
    checkOut,
    resetDailyCounts,
    resetChats,
    updatePlayground,
    hasUserCheckedIn,
    checkInRecords
  };
}
