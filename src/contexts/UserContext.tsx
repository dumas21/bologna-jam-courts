
import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  isLoggedIn: boolean;
  nickname: string;  // solo nickname, niente email
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("userLoggedIn");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [nickname, setNickname] = useState<string>(() => {
    const saved = localStorage.getItem("userNickname");
    return saved ? JSON.parse(saved) : "";
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem("isUserAdmin");
    return saved ? JSON.parse(saved) : false;
  });

  const login = (nickname: string, isAdmin: boolean = false) => {
    // Determina se l'utente è admin (per esempio se il nickname è "matteo")
    const adminStatus = nickname.toLowerCase() === "matteo" || isAdmin;
    
    localStorage.setItem("userLoggedIn", "true");
    localStorage.setItem("userNickname", JSON.stringify(nickname));
    localStorage.setItem("isUserAdmin", JSON.stringify(adminStatus));
    
    setIsLoggedIn(true);
    setNickname(nickname);
    setIsAdmin(adminStatus);
    
    console.log(`User logged in: ${nickname}, Admin status: ${adminStatus}`);
  };

  const logout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userNickname");
    localStorage.removeItem("isUserAdmin");
    setIsLoggedIn(false);
    setNickname("");
    setIsAdmin(false);
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, nickname, isAdmin, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
