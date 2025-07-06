
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AuthState } from '@/types/auth';

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Only synchronous state updates here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Sessione iniziale:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Also defer this to prevent blocking
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Caricamento profilo per utente:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (profileData) {
        console.log('Profilo caricato:', profileData);
        setProfile({
          id: profileData.id,
          email: profileData.email,
          username: profileData.nickname,
          nickname: profileData.nickname
        });
      } else {
        console.log('Nessun profilo trovato per l\'utente:', userId);
        
        // Se non c'è profilo ma c'è un utente, proviamo a crearlo
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Tentativo di creare profilo mancante per:', user.email);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              nickname: user.user_metadata?.username || user.email?.split('@')[0] || 'User'
            });
          
          if (!insertError) {
            console.log('Profilo creato con successo');
            // Ricarica il profilo
            setTimeout(() => loadUserProfile(userId), 500);
          } else {
            console.error('Errore nella creazione del profilo:', insertError);
          }
        }
        
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user
  };
};
