
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SupabaseUserContextType } from "./auth/types";
import { fetchProfile } from "./auth/profileService";
import { logSecurityEvent } from "./auth/securityService";
import { signUp as authSignUp, signIn as authSignIn } from "./auth/authService";

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isLoggedIn: false,
  nickname: "",
  isAdmin: false,
  signUp: async () => ({ success: false }),
  signIn: async () => ({ success: false }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const SupabaseUserProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile when authenticated
          setTimeout(async () => {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            setIsLoading(false);

            // Log authentication events
            if (event === 'SIGNED_IN') {
              await logSecurityEvent(session.user, 'user_signed_in', { 
                login_method: 'email',
                timestamp: new Date().toISOString()
              });
            }
          }, 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        
        setTimeout(async () => {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
          setIsLoading(false);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nickname: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      return await authSignUp(email, password, nickname);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      return await authSignIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await logSecurityEvent(user, 'user_signed_out');
      await supabase.auth.signOut();
      
      toast({
        title: "LOGOUT EFFETTUATO",
        description: "Sei stato disconnesso con successo",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  const isLoggedIn = !!user && !!session;
  const nickname = profile?.nickname || user?.user_metadata?.nickname || "";
  const isAdmin = profile?.is_admin || false;

  return (
    <SupabaseUserContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isLoggedIn,
      nickname,
      isAdmin,
      signUp,
      signIn,
      signOut,
      refreshProfile
    }}>
      {children}
    </SupabaseUserContext.Provider>
  );
};

export const useSupabaseUser = () => useContext(SupabaseUserContext);
