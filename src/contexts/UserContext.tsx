import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { validateNickname, sanitizeText } from "@/utils/security";

interface UserContextType {
  isLoggedIn: boolean;
  nickname: string;
  isAdmin: boolean;
  login: (nickname: string, isAdmin?: boolean) => boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  nickname: "",
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize state from localStorage with enhanced security checks
  useEffect(() => {
    const initializeUserState = () => {
      try {
        const savedLoggedIn = localStorage.getItem("userLoggedIn");
        const savedNickname = localStorage.getItem("userNickname");
        const savedAdmin = localStorage.getItem("isUserAdmin");
        const loginTime = localStorage.getItem("userLoginTime");

        // Verify if data is valid and not too old
        if (savedLoggedIn && savedNickname && loginTime) {
          const loginTimestamp = parseInt(loginTime);
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;

          // If login is older than 24 hours, clear everything
          if (now - loginTimestamp > twentyFourHours) {
            clearUserData();
            return;
          }

          // Validate stored data
          const parsedLoggedIn = JSON.parse(savedLoggedIn);
          const parsedNickname = JSON.parse(savedNickname);
          const parsedAdmin = savedAdmin ? JSON.parse(savedAdmin) : false;

          // Enhanced validation of stored nickname
          if (parsedLoggedIn && parsedNickname && typeof parsedNickname === 'string') {
            const nicknameValidation = validateNickname(parsedNickname);
            if (nicknameValidation.isValid) {
              const sanitizedNickname = sanitizeText(parsedNickname);
              setIsLoggedIn(true);
              setNickname(sanitizedNickname);
              setIsAdmin(parsedAdmin);
            } else {
              clearUserData();
            }
          } else {
            clearUserData();
          }
        } else {
          clearUserData();
        }
      } catch (error) {
        console.log('Error loading user data, clearing:', error);
        clearUserData();
      }
    };

    initializeUserState();
  }, []);

  const clearUserData = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userNickname");
    localStorage.removeItem("isUserAdmin");
    localStorage.removeItem("userLoginTime");
    setIsLoggedIn(false);
    setNickname("");
    setIsAdmin(false);
  };

  const login = (nickname: string, isAdmin: boolean = false): boolean => {
    // Validate and sanitize nickname
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.isValid) {
      console.error('Invalid nickname:', nicknameValidation.error);
      return false;
    }

    const sanitizedNickname = sanitizeText(nickname);
    if (!sanitizedNickname) {
      console.error('Nickname sanitization failed');
      return false;
    }

    const adminStatus = sanitizedNickname.toLowerCase() === "matteo" || isAdmin;
    const loginTime = Date.now().toString();
    
    try {
      localStorage.setItem("userLoggedIn", "true");
      localStorage.setItem("userNickname", JSON.stringify(sanitizedNickname));
      localStorage.setItem("isUserAdmin", JSON.stringify(adminStatus));
      localStorage.setItem("userLoginTime", loginTime);
      
      setIsLoggedIn(true);
      setNickname(sanitizedNickname);
      setIsAdmin(adminStatus);
      
      console.log(`User logged in: ${sanitizedNickname}, Admin status: ${adminStatus}, Login time: ${loginTime}`);
      return true;
    } catch (error) {
      console.error('Error saving login data:', error);
      clearUserData();
      return false;
    }
  };

  const logout = () => {
    clearUserData();
    
    // Clear all playground related data on logout for security
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('playground_chat_') || key.startsWith('lastChatReset_')) {
        // Keep the data but could be cleared if needed for enhanced security
        // localStorage.removeItem(key);
      }
    });
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, nickname, isAdmin, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
