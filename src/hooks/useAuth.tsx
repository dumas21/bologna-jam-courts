
import { AuthService } from '@/services/authService';
import { useAuthState } from '@/hooks/useAuthState';
import { SignUpData } from '@/types/auth';

export const useAuth = () => {
  const authState = useAuthState();

  const signUp = async (email: string, password: string, username: string, newsletter: boolean = false, privacyVersion: string = '1.0') => {
    const signUpData: SignUpData = { email, password, username, newsletter, privacyVersion };
    return AuthService.signUp(signUpData);
  };

  const signInWithPassword = async (email: string, password: string) => {
    return AuthService.signInWithPassword(email, password);
  };

  const signInWithUsername = async (username: string, password: string) => {
    return AuthService.signInWithUsername(username, password);
  };

  const signInWithMagicLink = async (email: string, username: string) => {
    return AuthService.signInWithMagicLink(email, username);
  };

  const signOut = async () => {
    const result = await AuthService.signOut();
    return result;
  };

  // Legacy function aliases for backward compatibility
  const login = (email: string, username: string) => {
    return signInWithMagicLink(email, username);
  };

  const logout = () => {
    return signOut();
  };

  return {
    ...authState,
    signUp,
    signInWithPassword,
    signInWithUsername,
    signInWithMagicLink,
    signOut,
    login,
    logout
  };
};
