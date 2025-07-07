
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

  const signOut = async () => {
    const result = await AuthService.signOut();
    return result;
  };

  return {
    ...authState,
    signUp,
    signInWithPassword,
    signOut
  };
};
