
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  nickname?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
            } else {
              setProfile({
                id: profileData.id,
                email: profileData.email,
                username: (profileData as any).username || profileData.nickname,
                nickname: profileData.nickname
              });
            }
          } catch (error) {
            console.error('Error in profile fetch:', error);
          }
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registrazione con email e password
  const signUp = async (email: string, password: string, username: string, newsletter: boolean = false, privacyVersion: string = '1.0') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Aggiorna il profilo esistente con l'username (il trigger ha già creato il record)
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              nickname: username // Usa nickname per ora, fino a quando username non è disponibile
            })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
        } catch (profileErr) {
          console.error('Profile update error:', profileErr);
        }

        // Salva il consenso newsletter se dato - usando query raw per evitare problemi di tipo
        if (newsletter) {
          try {
            const { error: newsletterError } = await supabase.rpc('log_security_event', {
              p_user_id: data.user.id,
              p_event_type: 'newsletter_consent',
              p_event_data: {
                email: email,
                consented: true,
                consented_at: new Date().toISOString(),
                privacy_version: privacyVersion
              }
            });

            if (newsletterError) {
              console.error('Error saving newsletter consent:', newsletterError);
            }
          } catch (e) {
            console.error('Newsletter consent error:', e);
          }
        }
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  // Login con username e password
  const signInWithUsername = async (username: string, password: string) => {
    try {
      // Per ora usa nickname per trovare l'utente (fino a quando username non è disponibile)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('nickname', username)
        .single();

      if (profileError || !profileData) {
        return { error: { message: 'Username non trovato' } };
      }

      // Poi usa l'email per il login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: password
      });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  // Funzioni legacy per compatibilità
  const signInWithMagicLink = async (email: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username
        }
      }
    });

    return { error };
  };

  const login = (email: string, username: string) => {
    return signInWithMagicLink(email, username);
  };

  const logout = () => {
    return signOut();
  };

  return {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signInWithUsername,
    signInWithMagicLink,
    signOut,
    login,
    logout,
    isAuthenticated: !!user
  };
};
