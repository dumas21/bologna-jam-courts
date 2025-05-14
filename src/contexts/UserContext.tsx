
import React, { createContext, useContext, useState, useEffect } from "react";

type UserContextType = {
  isLoggedIn: boolean;
  username: string | null;
  subscribedPlaygrounds: string[];
  login: (username: string) => void;
  logout: () => void;
  subscribeToPlayground: (playgroundId: string) => void;
  unsubscribeFromPlayground: (playgroundId: string) => void;
  isSubscribed: (playgroundId: string) => boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [subscribedPlaygrounds, setSubscribedPlaygrounds] = useState<string[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('playgroundJamUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUsername(userData.username);
      setSubscribedPlaygrounds(userData.subscribedPlaygrounds || []);
    }
  }, []);

  // Save user data to localStorage
  useEffect(() => {
    if (isLoggedIn && username) {
      localStorage.setItem('playgroundJamUser', JSON.stringify({
        username,
        subscribedPlaygrounds
      }));
    } else if (!isLoggedIn) {
      localStorage.removeItem('playgroundJamUser');
    }
  }, [isLoggedIn, username, subscribedPlaygrounds]);

  const login = (newUsername: string) => {
    setIsLoggedIn(true);
    setUsername(newUsername);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setSubscribedPlaygrounds([]);
  };

  const subscribeToPlayground = (playgroundId: string) => {
    if (!subscribedPlaygrounds.includes(playgroundId)) {
      setSubscribedPlaygrounds([...subscribedPlaygrounds, playgroundId]);
    }
  };

  const unsubscribeFromPlayground = (playgroundId: string) => {
    setSubscribedPlaygrounds(
      subscribedPlaygrounds.filter(id => id !== playgroundId)
    );
  };

  const isSubscribed = (playgroundId: string) => {
    return subscribedPlaygrounds.includes(playgroundId);
  };

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        username,
        subscribedPlaygrounds,
        login,
        logout,
        subscribeToPlayground,
        unsubscribeFromPlayground,
        isSubscribed
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
