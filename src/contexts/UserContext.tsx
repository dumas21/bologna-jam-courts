
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { validateNickname, sanitizeText, loginRateLimiter, secureStorage } from "@/utils/security";
import { validateSession, SECURITY_CONFIG } from "@/config/security";

interface UserContextType {
  isLoggedIn: boolean;
  nickname: string;
  isAdmin: boolean;
  sessionValid: boolean;
  login: (nickname: string, isAdmin?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  refreshSession: () => void;
}

const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  nickname: "",
  isAdmin: false,
  sessionValid: true,
  login: () => ({ success: false }),
  logout: () => {},
  refreshSession: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [sessionValid, setSessionValid] = useState<boolean>(true);

  // Initialize state from localStorage with enhanced security checks
  useEffect(() => {
    const initializeUserState = () => {
      try {
        const savedLoggedIn = secureStorage.getItem("userLoggedIn");
        const savedNickname = secureStorage.getItem("userNickname");
        const savedAdmin = secureStorage.getItem("isUserAdmin");
        const loginTime = secureStorage.getItem("userLoginTime");

        // Validate session
        const sessionCheck = validateSession();
        setSessionValid(sessionCheck.isValid);

        if (!sessionCheck.isValid) {
          clearUserData();
          return;
        }

        // Verify if data is valid
        if (savedLoggedIn && savedNickname && loginTime) {
          const parsedLoggedIn = savedLoggedIn === true || savedLoggedIn === "true";
          const parsedNickname = typeof savedNickname === 'string' ? savedNickname : '';
          const parsedAdmin = savedAdmin === true || savedAdmin === "true";

          // Enhanced validation of stored nickname
          if (parsedLoggedIn && parsedNickname) {
            const nicknameValidation = validateNickname(parsedNickname);
            if (nicknameValidation.isValid) {
              const sanitizedNickname = sanitizeText(parsedNickname);
              
              // Additional security check for admin status
              const isValidAdmin = parsedAdmin && (
                SECURITY_CONFIG.ADMIN_EMAILS.includes(sanitizedNickname.toLowerCase() + "@playground.com") ||
                sanitizedNickname.toLowerCase() === "matteo"
              );

              setIsLoggedIn(true);
              setNickname(sanitizedNickname);
              setIsAdmin(isValidAdmin);

              // Refresh session if needed
              if (sessionCheck.shouldRefresh) {
                refreshSession();
              }
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
        console.error('Error loading user data, clearing:', error);
        clearUserData();
      }
    };

    initializeUserState();
  }, []);

  const clearUserData = () => {
    // Clear all user-related data from localStorage
    secureStorage.removeItem("userLoggedIn");
    secureStorage.removeItem("userNickname");
    secureStorage.removeItem("isUserAdmin");
    secureStorage.removeItem("userLoginTime");
    secureStorage.removeItem("userSessionToken");
    
    setIsLoggedIn(false);
    setNickname("");
    setIsAdmin(false);
    setSessionValid(true);
  };

  const login = (nickname: string, isAdmin: boolean = false): { success: boolean; error?: string } => {
    // Check rate limiting
    const rateLimitCheck = loginRateLimiter.isAllowed('login_attempts');
    if (!rateLimitCheck.allowed) {
      const remainingMinutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000);
      return { 
        success: false, 
        error: `Troppi tentativi di login. Riprova tra ${remainingMinutes} minuti.` 
      };
    }

    // Validate and sanitize nickname
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.isValid) {
      return { success: false, error: nicknameValidation.error };
    }

    const sanitizedNickname = sanitizeText(nickname);
    if (!sanitizedNickname) {
      return { success: false, error: 'Nickname sanitization failed' };
    }

    // Enhanced admin validation - only allow specific users
    const adminStatus = (
      sanitizedNickname.toLowerCase() === "matteo" ||
      SECURITY_CONFIG.ADMIN_EMAILS.some(email => 
        email.startsWith(sanitizedNickname.toLowerCase())
      )
    ) || isAdmin;

    const loginTime = Date.now().toString();
    
    try {
      // Generate session token for additional security
      const sessionToken = crypto.getRandomValues(new Uint8Array(32));
      const tokenString = Array.from(sessionToken, byte => byte.toString(16).padStart(2, '0')).join('');

      const success = secureStorage.setItem("userLoggedIn", true) &&
                    secureStorage.setItem("userNickname", sanitizedNickname) &&
                    secureStorage.setItem("isUserAdmin", adminStatus) &&
                    secureStorage.setItem("userLoginTime", loginTime) &&
                    secureStorage.setItem("userSessionToken", tokenString);

      if (!success) {
        return { success: false, error: 'Failed to save login data' };
      }
      
      setIsLoggedIn(true);
      setNickname(sanitizedNickname);
      setIsAdmin(adminStatus);
      setSessionValid(true);
      
      // Reset rate limiter on successful login
      loginRateLimiter.reset('login_attempts');
      
      console.log(`User logged in securely: ${sanitizedNickname}, Admin: ${adminStatus}`);
      return { success: true };
    } catch (error) {
      console.error('Error saving login data:', error);
      clearUserData();
      return { success: false, error: 'Login failed due to storage error' };
    }
  };

  const refreshSession = () => {
    if (isLoggedIn) {
      const newLoginTime = Date.now().toString();
      secureStorage.setItem("userLoginTime", newLoginTime);
      console.log('Session refreshed');
    }
  };

  const logout = () => {
    clearUserData();
    
    // Clear sensitive playground data on logout for security
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('playground_chat_') || 
          key.startsWith('lastChatReset_') ||
          key.startsWith('voted_')) {
        secureStorage.removeItem(key);
      }
    });

    console.log('User logged out securely');
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, 
      nickname, 
      isAdmin, 
      sessionValid, 
      login, 
      logout, 
      refreshSession 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
