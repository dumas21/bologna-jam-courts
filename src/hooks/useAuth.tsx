
import { useState, useEffect } from 'react';

interface User {
  email: string;
  username: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedEmail = localStorage.getItem('userEmail');
    const storedUsername = localStorage.getItem('username');
    
    if (storedEmail && storedUsername) {
      setUser({
        email: storedEmail,
        username: storedUsername
      });
    }
    
    setIsLoading(false);
  }, []);

  const login = (email: string, username: string) => {
    // Store user data in localStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', username);
    
    setUser({
      email,
      username
    });
  };

  const logout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
