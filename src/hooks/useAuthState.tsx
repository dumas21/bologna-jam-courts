
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
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Usa setTimeout per evitare problemi di concorrenza
          setTimeout(() => {
            if (isMounted) {
              loadUserProfile(newSession.user.id);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          setIsLoading(false);
          return;
        }
        
        // Verifica validità sessione se presente
        if (session?.access_token) {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsLoading(false);
              return;
            }
          } catch (tokenError) {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsLoading(false);
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Usa setTimeout per evitare problemi di concorrenza
          setTimeout(() => {
            if (isMounted) {
              loadUserProfile(session.user.id);
            }
          }, 100);
        }
        
        setIsLoading(false);
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        // Se il profilo non esiste, prova a crearlo
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              nickname: user.user_metadata?.username || user.email?.split('@')[0] || 'User'
            })
            .select()
            .single();
          
          if (!insertError && newProfile) {
            setProfile({
              id: newProfile.id,
              email: newProfile.email,
              username: newProfile.nickname,
              nickname: newProfile.nickname
            });
          } else {
            setProfile(null);
          }
        }
        return;
      }
      
      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email,
          username: profileData.nickname,
          nickname: profileData.nickname
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      setProfile(null);
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user && !!session?.access_token
  };
};
