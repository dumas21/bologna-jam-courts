
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
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔔 Auth state changed:', event, session?.user?.id);
        
        // IMPORTANTE: Aggiorna lo stato SOLO se la sessione è realmente cambiata
        const sessionChanged = JSON.stringify(session) !== JSON.stringify(session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('🔄 Caricamento profilo per utente autenticato:', session.user.id);
          setTimeout(() => {
            if (isMounted) {
              loadUserProfile(session.user.id);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Utente disconnesso, pulizia profilo');
          setProfile(null);
        }
        
        if (event !== 'INITIAL_SESSION') {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Controllo sessione iniziale...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ Errore nel recupero sessione:', error);
          setIsLoading(false);
          return;
        }
        
        console.log('📊 Sessione iniziale:', session?.user?.id || 'NESSUNA');
        
        // VERIFICA REALE della sessione controllando se è valida
        if (session?.access_token) {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
            if (userError || !user) {
              console.log('⚠️ Sessione non valida, pulizia...');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsLoading(false);
              return;
            }
          } catch (tokenError) {
            console.log('⚠️ Token non valido, pulizia sessione...');
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
          await loadUserProfile(session.user.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('💥 Errore imprevisto nel recupero sessione:', error);
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
      console.log('📋 Caricamento profilo per utente:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Errore nel caricamento profilo:', error);
        
        // Se il profilo non esiste, prova a crearlo
        console.log('🔧 Tentativo di creare profilo mancante...');
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
          
          if (insertError) {
            console.error('❌ Errore nella creazione del profilo:', insertError);
            setProfile(null);
          } else if (newProfile) {
            console.log('✅ Profilo creato con successo:', newProfile.nickname);
            setProfile({
              id: newProfile.id,
              email: newProfile.email,
              username: newProfile.nickname,
              nickname: newProfile.nickname
            });
          }
        }
        return;
      }
      
      if (profileData) {
        console.log('✅ Profilo caricato:', profileData.nickname);
        setProfile({
          id: profileData.id,
          email: profileData.email,
          username: profileData.nickname,
          nickname: profileData.nickname
        });
      } else {
        console.log('⚠️ Nessun profilo trovato per utente:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('💥 Errore imprevisto nel caricamento profilo:', error);
      setProfile(null);
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user && !!session && !!session.access_token
  };
};
