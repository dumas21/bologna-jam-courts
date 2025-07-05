
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  nickname?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  newsletter?: boolean;
  privacyVersion?: string;
}

export interface AuthResponse {
  data: any;
  error: any;
}
