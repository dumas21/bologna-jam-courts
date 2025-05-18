import { useState, useEffect } from "react";
import { Playground, Comment, CheckInRecord, RegisteredUser } from "@/types/playground";
import { playgroundData as initialData } from "@/data/playgroundData";
import { getDailyResetTime } from "@/utils/timeUtils";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

export type { CheckInRecord, RegisteredUser };

export function usePlaygrounds() {
  const { toast } = useToast();
  const [playgrounds, setPlaygrounds] = useState<Playground[]>(() => {
    // Aggiungiamo log per il debugging
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
  
  // Array per tenere traccia degli utenti che hanno fatto check-in
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem("checkInRecords");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });
  
  // Array per tenere traccia degli utenti registrati
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem("registeredUsers");
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
  
  // Save registered users
  useEffect(() => {
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
  }, [registeredUsers]);
  
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
  
  // Set up chat reset timer (ogni 48 ore)
  useEffect(() => {
    const setupChatResetTimer = () => {
      // Check if we need to reset chats
      const lastChatReset = localStorage.getItem("lastChatReset");
      const now = Date.now();
      const twodays = 2 * 24 * 60 * 60 * 1000; // 48 hours in milliseconds
      
      if (!lastChatReset || now - Number(lastChatReset) > twodays) {
        // Reset comments dopo 48 ore
        resetChats();
        localStorage.setItem("lastChatReset", now.toString());
      }
      
      // Setup next timer
      const timeUntilReset = twodays - (now - (lastChatReset ? Number(lastChatReset) : now));
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
  
  // Reset chat ogni 48 ore
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
      description: "Le chat dei playground sono state resettate dopo 48 ore.",
    });
  };
  
  // Player check-in to a playground with email
  const checkIn = (playgroundId: string, email: string, nickname: string = "") => {
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
    
    // Usa il nickname se fornito, altrimenti cerca l'utente registrato
    let userNickname = nickname;
    if (!userNickname) {
      const user = registeredUsers.find(user => user.email === email);
      userNickname = user ? user.nickname : email.split("@")[0];
    }
    
    // Aggiungi il record di check-in
    setCheckInRecords(current => [
      ...current, 
      { playgroundId, email, nickname: userNickname, timestamp: Date.now() }
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
    setPlaygrounds(current => {
      // Check if this playground already exists
      const existingPlaygroundIndex = current.findIndex(pg => pg.id === updatedPlayground.id);
      
      if (existingPlaygroundIndex >= 0) {
        // Update existing playground
        const updatedPlaygrounds = [...current];
        updatedPlaygrounds[existingPlaygroundIndex] = updatedPlayground;
        return updatedPlaygrounds;
      } else {
        // Add new playground
        return [...current, updatedPlayground];
      }
    });
    
    toast({
      title: "Playground aggiornato",
      description: `${updatedPlayground.name} è stato aggiornato con successo.`,
    });
    
    // Play sound effect
    const audio = new Audio('/sounds/add.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    return true;
  };
  
  // Add a new playground
  const addPlayground = (newPlayground: Playground) => {
    setPlaygrounds(current => [...current, newPlayground]);
    
    toast({
      title: "Playground aggiunto",
      description: `${newPlayground.name} è stato aggiunto con successo.`,
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
  
  // Funzione per registrare un nuovo utente - UPDATED to include all required properties
  const registerUser = (email: string, password: string, nickname: string) => {
    // Verifica se l'utente è già registrato
    const existingUser = registeredUsers.find(user => user.email === email);
    
    if (existingUser) {
      toast({
        title: "Utente già registrato",
        description: "Questa email è già registrata nel sistema.",
        variant: "destructive"
      });
      return false;
    }
    
    // Verifica se il nickname è già in uso
    const existingNickname = registeredUsers.find(user => user.nickname === nickname);
    
    if (existingNickname) {
      toast({
        title: "Nickname già in uso",
        description: "Questo nickname è già utilizzato da un altro utente.",
        variant: "destructive"
      });
      return false;
    }
    
    // Determina se è il primo utente (primo admin)
    const isFirstUser = registeredUsers.length === 0;
    
    // Registra il nuovo utente con l'ID generato e createdAt
    const newUser: RegisteredUser = {
      id: uuidv4(), // Genera un UUID univoco
      email,
      password, // In un'app reale, questa password dovrebbe essere criptata
      nickname,
      isAdmin: isFirstUser || email === "bergami.matteo@gmail.com", // Il primo utente o bergami.matteo@gmail.com sono admin
      registrationDate: Date.now(),
      createdAt: new Date().toISOString() // Aggiunta questa proprietà richiesta
    };
    
    setRegisteredUsers(current => [...current, newUser]);
    
    toast({
      title: "Registrazione completata",
      description: `Benvenuto, ${nickname}! ${isFirstUser ? "Sei stato registrato come amministratore." : ""}`,
    });
    
    return true;
  };
  
  // Funzione per verificare le credenziali di login
  const verifyLogin = (email: string, password: string) => {
    const user = registeredUsers.find(
      user => user.email === email && user.password === password
    );
    
    return user || null;
  };
  
  // Funzione per ottenere la lista degli utenti registrati (solo per admin)
  const getRegisteredUsers = () => {
    return registeredUsers;
  };
  
  // Funzione per ottenere la lista degli utenti che hanno fatto check-in oggi
  const getTodayCheckins = () => {
    return checkInRecords;
  };
  
  // Funzione per reimpostare i conteggi delle presenze a zero
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
  
  // Get nickname for an email
  const getNicknameForEmail = (email: string): string => {
    const user = registeredUsers.find(user => user.email === email);
    return user ? user.nickname : email.split('@')[0];
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
    checkInRecords,
    registerUser,
    verifyLogin,
    getRegisteredUsers,
    getTodayCheckins,
    resetAttendanceCounts,
    getNicknameForEmail
  };
}
