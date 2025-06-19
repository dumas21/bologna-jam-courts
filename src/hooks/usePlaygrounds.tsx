import { useState, useEffect } from "react";
import { Playground, Comment, CheckInRecord, RegisteredUser } from "@/types/playground";
import { playgroundData as initialData } from "@/data/playgroundData";
import { getDailyResetTime } from "@/utils/timeUtils";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { checkInRateLimiter, sanitizeText, validatePlaygroundName } from "@/utils/security";

export type { CheckInRecord, RegisteredUser };

export function usePlaygrounds() {
  const { toast } = useToast();
  const [playgrounds, setPlaygrounds] = useState<Playground[]>(() => {
    console.log("Inizializzazione playgrounds...");
    const saved = localStorage.getItem("playgroundData");
    if (saved) {
      const parsedData = JSON.parse(saved);
      console.log("Dati caricati da localStorage:", parsedData);
      return parsedData;
    }
    console.log("Utilizzo dati iniziali:", initialData);
    return initialData;
  });
  
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
    console.log("Playgrounds aggiornati e salvati:", playgrounds);
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
        setupDailyResetTimer();
      }, timeUntilReset);
      
      return () => clearTimeout(timerId);
    };
    
    return setupDailyResetTimer();
  }, []);
  
  // Set up chat reset timer (ogni 48 ore)
  useEffect(() => {
    const setupChatResetTimer = () => {
      const lastChatReset = localStorage.getItem("lastChatReset");
      const now = Date.now();
      const twodays = 2 * 24 * 60 * 60 * 1000;
      
      if (!lastChatReset || now - Number(lastChatReset) > twodays) {
        resetChats();
        localStorage.setItem("lastChatReset", now.toString());
      }
      
      const timeUntilReset = twodays - (now - (lastChatReset ? Number(lastChatReset) : now));
      const timerId = setTimeout(() => {
        resetChats();
        localStorage.setItem("lastChatReset", Date.now().toString());
        setupChatResetTimer();
      }, timeUntilReset);
      
      return () => clearTimeout(timerId);
    };
    
    return setupChatResetTimer();
  }, []);
  
  const resetDailyCounts = () => {
    setPlaygrounds(current => 
      current.map(pg => ({ 
        ...pg, 
        currentPlayers: 0,
      }))
    );
    
    setCheckInRecords([]);
    
    const audio = new Audio('/sounds/reset.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    toast({
      title: "Reset giornaliero",
      description: "I conteggi giornalieri sono stati azzerati e tutti gli utenti sono stati disconnessi.",
    });
  };
  
  const resetChats = () => {
    setPlaygrounds(current => 
      current.map(pg => ({ 
        ...pg, 
        comments: [],
      }))
    );
    
    const audio = new Audio('/sounds/message.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    toast({
      title: "Reset chat",
      description: "Le chat dei playground sono state resettate dopo 48 ore.",
    });
  };
  
  const checkIn = (playgroundId: string, nickname: string, displayNickname: string = "") => {
    // Enhanced security checks
    const sanitizedNickname = sanitizeText(nickname);
    const sanitizedDisplayNickname = displayNickname ? sanitizeText(displayNickname) : "";
    
    if (!sanitizedNickname) {
      toast({
        title: "Errore di sicurezza",
        description: "Nickname non valido",
        variant: "destructive",
      });
      return false;
    }
    
    // Check rate limiting
    if (!checkInRateLimiter.isAllowed(sanitizedNickname)) {
      const remainingTime = Math.ceil(checkInRateLimiter.getRemainingTime(sanitizedNickname) / 1000);
      toast({
        title: "Troppi check-in",
        description: `Aspetta ${remainingTime} secondi prima di fare un altro check-in`,
        variant: "destructive",
      });
      return false;
    }
    
    const existingRecord = checkInRecords.find(
      record => record.playgroundId === playgroundId && record.nickname === sanitizedNickname
    );
    
    if (existingRecord) {
      toast({
        title: "Check-in già effettuato",
        description: "Hai già fatto il check-in in questo playground oggi.",
      });
      return false;
    }
    
    const userNickname = sanitizedDisplayNickname || sanitizedNickname;
    
    setCheckInRecords(current => [
      ...current, 
      { 
        playgroundId, 
        email: sanitizedNickname, 
        nickname: userNickname, 
        timestamp: Date.now() 
      }
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
  
  const checkOut = (playgroundId: string, nickname: string) => {
    const sanitizedNickname = sanitizeText(nickname);
    
    if (!sanitizedNickname) {
      toast({
        title: "Errore di sicurezza",
        description: "Nickname non valido",
        variant: "destructive",
      });
      return false;
    }
    
    const recordExists = checkInRecords.some(
      record => record.playgroundId === playgroundId && record.nickname === sanitizedNickname
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
        record => !(record.playgroundId === playgroundId && record.nickname === sanitizedNickname)
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
  
  const updatePlayground = (updatedPlayground: Playground) => {
    // Validate and sanitize playground data
    const nameValidation = validatePlaygroundName(updatedPlayground.name);
    if (!nameValidation.isValid) {
      toast({
        title: "Errore validazione",
        description: nameValidation.error,
        variant: "destructive",
      });
      return false;
    }
    
    const sanitizedPlayground = {
      ...updatedPlayground,
      name: sanitizeText(updatedPlayground.name),
      address: sanitizeText(updatedPlayground.address),
      type: updatedPlayground.type ? sanitizeText(updatedPlayground.type) : undefined,
    };
    
    setPlaygrounds(current => {
      const existingPlaygroundIndex = current.findIndex(pg => pg.id === sanitizedPlayground.id);
      
      if (existingPlaygroundIndex >= 0) {
        const updatedPlaygrounds = [...current];
        updatedPlaygrounds[existingPlaygroundIndex] = sanitizedPlayground;
        return updatedPlaygrounds;
      } else {
        return [...current, sanitizedPlayground];
      }
    });
    
    toast({
      title: "Playground aggiornato",
      description: `${sanitizedPlayground.name} è stato aggiornato con successo.`,
    });
    
    const audio = new Audio('/sounds/add.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    return true;
  };
  
  const addPlayground = (newPlayground: Playground) => {
    // Validate and sanitize new playground data
    const nameValidation = validatePlaygroundName(newPlayground.name);
    if (!nameValidation.isValid) {
      toast({
        title: "Errore validazione",
        description: nameValidation.error,
        variant: "destructive",
      });
      return false;
    }
    
    const sanitizedPlayground = {
      ...newPlayground,
      name: sanitizeText(newPlayground.name),
      address: sanitizeText(newPlayground.address),
      type: newPlayground.type ? sanitizeText(newPlayground.type) : undefined,
    };
    
    setPlaygrounds(current => [...current, sanitizedPlayground]);
    
    toast({
      title: "Playground aggiunto",
      description: `${sanitizedPlayground.name} è stato aggiunto con successo.`,
    });
    
    const audio = new Audio('/sounds/add.mp3');
    audio.play().catch(err => console.log('Audio playbook error:', err));
    
    return true;
  };
  
  const hasUserCheckedIn = (playgroundId: string, nickname: string) => {
    const sanitizedNickname = sanitizeText(nickname);
    return checkInRecords.some(
      record => record.playgroundId === playgroundId && record.nickname === sanitizedNickname
    );
  };
  
  const resetAttendanceCounts = () => {
    setPlaygrounds(current => 
      current.map(pg => ({ 
        ...pg, 
        currentPlayers: 0,
        totalCheckins: 0
      }))
    );
    
    setCheckInRecords([]);
    
    toast({
      title: "Conteggi reimpostati",
      description: "Tutti i conteggi delle presenze sono stati azzerati.",
    });
    
    return true;
  };
  
  const getTodayCheckins = () => {
    return checkInRecords;
  };

  // Convert checkInRecords array to object format for backward compatibility
  const checkInRecordsObject = checkInRecords.reduce((acc, record) => {
    if (!acc[record.playgroundId]) {
      acc[record.playgroundId] = [];
    }
    acc[record.playgroundId].push(record.nickname);
    return acc;
  }, {} as { [playgroundId: string]: string[] });
  
  const resetToOriginalData = () => {
    setPlaygrounds(initialData);
    setCheckInRecords([]);
    localStorage.removeItem("playgroundData");
    localStorage.removeItem("checkInRecords");
    
    toast({
      title: "DATI RIPRISTINATI",
      description: "I playground sono stati ripristinati ai dati originali (10 campi).",
    });
    
    const audio = new Audio('/sounds/reset.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    return true;
  };
  
  return { 
    playgrounds, 
    totalCheckIns,
    checkIn, 
    checkOut,
    resetDailyCounts,
    resetChats,
    updatePlayground,
    addPlayground,
    hasUserCheckedIn,
    checkInRecords: checkInRecordsObject,
    getTodayCheckins,
    resetAttendanceCounts,
    resetToOriginalData
  };
}
