
import { User, Session } from "@supabase/supabase-js";

export interface SupabaseUserContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  nickname: string;
  isAdmin: boolean;
  signUp: (email: string, password: string, nickname: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
