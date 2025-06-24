
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SupabaseUserContextType {
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

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Log security events
  const logSecurityEvent = async (eventType: string, eventData?: any) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_data: eventData || null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

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
              await logSecurityEvent('user_signed_in', { 
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
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nickname: nickname
          }
        }
      });

      if (error) {
        // Gestisci errori specifici di registrazione
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return { success: false, error: 'User already registered' };
        }
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        // Email confirmation richiesta per nuovi utenti
        return { success: true };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Gestisci errori specifici di login
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid login credentials' };
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Email not confirmed' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await logSecurityEvent('user_signed_out');
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
