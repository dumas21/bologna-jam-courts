
import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  isLoggedIn: boolean;
  username: string;  // è l'email
  nickname: string;  // nickname dell'utente
  isAdmin: boolean;
  login: (username: string, isAdmin?: boolean, nickname?: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  username: "",
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
  
  const [username, setUsername] = useState<string>(() => {
    const saved = localStorage.getItem("username");
    return saved ? JSON.parse(saved) : "";
  });
  
  const [nickname, setNickname] = useState<string>(() => {
    const saved = localStorage.getItem("userNickname");
    return saved ? JSON.parse(saved) : "";
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem("isUserAdmin");
    return saved ? JSON.parse(saved) : false;
  });

  const login = (username: string, isAdmin: boolean = false, nickname: string = "") => {
    // Special handling for admin user
    const isSpecialAdmin = username === "bergami.matteo@gmail.com";
    const adminStatus = isSpecialAdmin ? true : isAdmin;
    const displayNickname = nickname || username.split('@')[0];
    
    localStorage.setItem("userLoggedIn", "true");
    localStorage.setItem("username", JSON.stringify(username));
    localStorage.setItem("userNickname", JSON.stringify(displayNickname));
    localStorage.setItem("isUserAdmin", JSON.stringify(adminStatus));
    
    setIsLoggedIn(true);
    setUsername(username);
    setNickname(displayNickname);
    setIsAdmin(adminStatus);
    
    console.log(`User logged in: ${username}, Nickname: ${displayNickname}, Admin status: ${adminStatus}`);
  };

  const logout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userNickname");
    localStorage.removeItem("isUserAdmin");
    setIsLoggedIn(false);
    setUsername("");
    setNickname("");
    setIsAdmin(false);
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, username, nickname, isAdmin, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
