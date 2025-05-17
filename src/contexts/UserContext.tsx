
import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  isLoggedIn: boolean;
  username: string;
  isAdmin: boolean;
  login: (username: string, isAdmin?: boolean) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  username: "",
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
  
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem("isUserAdmin");
    return saved ? JSON.parse(saved) : false;
  });

  const login = (username: string, isAdmin: boolean = false) => {
    // Special handling for admin user
    const isSpecialAdmin = username === "bergami.matteo@gmail.com";
    const adminStatus = isSpecialAdmin ? true : isAdmin;
    
    localStorage.setItem("userLoggedIn", "true");
    localStorage.setItem("username", JSON.stringify(username));
    localStorage.setItem("isUserAdmin", JSON.stringify(adminStatus));
    
    setIsLoggedIn(true);
    setUsername(username);
    setIsAdmin(adminStatus);
    
    console.log(`User logged in: ${username}, Admin status: ${adminStatus}`);
  };

  const logout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("isUserAdmin");
    setIsLoggedIn(false);
    setUsername("");
    setIsAdmin(false);
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, username, isAdmin, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
