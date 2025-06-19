
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface UserContextType {
  isLoggedIn: boolean;
  nickname: string;
  isAdmin: boolean;
  login: (nickname: string, isAdmin?: boolean) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  nickname: "",
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Inizializza lo stato dall'localStorage solo se valido
  useEffect(() => {
    const initializeUserState = () => {
      try {
        const savedLoggedIn = localStorage.getItem("userLoggedIn");
        const savedNickname = localStorage.getItem("userNickname");
        const savedAdmin = localStorage.getItem("isUserAdmin");
        const loginTime = localStorage.getItem("userLoginTime");

        // Verifica se i dati sono validi e non troppo vecchi
        if (savedLoggedIn && savedNickname && loginTime) {
          const loginTimestamp = parseInt(loginTime);
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;

          // Se il login è più vecchio di 24 ore, pulisci tutto
          if (now - loginTimestamp > twentyFourHours) {
            clearUserData();
            return;
          }

          // Solo se tutti i controlli passano, ripristina lo stato
          const parsedLoggedIn = JSON.parse(savedLoggedIn);
          const parsedNickname = JSON.parse(savedNickname);
          const parsedAdmin = savedAdmin ? JSON.parse(savedAdmin) : false;

          if (parsedLoggedIn && parsedNickname && typeof parsedNickname === 'string') {
            setIsLoggedIn(true);
            setNickname(parsedNickname);
            setIsAdmin(parsedAdmin);
          } else {
            clearUserData();
          }
        } else {
          clearUserData();
        }
      } catch (error) {
        console.log('Errore nel caricamento dei dati utente, pulizia in corso:', error);
        clearUserData();
      }
    };

    initializeUserState();
  }, []);

  const clearUserData = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userNickname");
    localStorage.removeItem("isUserAdmin");
    localStorage.removeItem("userLoginTime");
    setIsLoggedIn(false);
    setNickname("");
    setIsAdmin(false);
  };

  const login = (nickname: string, isAdmin: boolean = false) => {
    const adminStatus = nickname.toLowerCase() === "matteo" || isAdmin;
    const loginTime = Date.now().toString();
    
    localStorage.setItem("userLoggedIn", "true");
    localStorage.setItem("userNickname", JSON.stringify(nickname));
    localStorage.setItem("isUserAdmin", JSON.stringify(adminStatus));
    localStorage.setItem("userLoginTime", loginTime);
    
    setIsLoggedIn(true);
    setNickname(nickname);
    setIsAdmin(adminStatus);
    
    console.log(`User logged in: ${nickname}, Admin status: ${adminStatus}, Login time: ${loginTime}`);
  };

  const logout = () => {
    clearUserData();
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, nickname, isAdmin, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
