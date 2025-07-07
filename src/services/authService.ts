
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false, privacyVersion = '1.0' } = signUpData;
      
      console.log('🚀 Avvio signUp con:', { email, username, newsletter });

      // URL di redirect per la conferma email
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/auth/confirm`;
      console.log('🔗 URL di redirect impostato:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username
          }
        }
      });

      if (error) {
        console.error('❌ Errore durante signUp:', error);
        throw error;
      }

      console.log('✅ SignUp completato:', data.user?.id);

      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email di conferma inviata a:', email);
        
        // Salva temporaneamente i dati dell'utente per il login successivo
        localStorage.setItem('pendingUserData', JSON.stringify({
          email,
          username,
          userId: data.user.id,
          timestamp: Date.now()
        }));
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Errore completo in signUp:', error);
      return { data: null, error };
    }
  }

  static async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Tentativo di login con email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('❌ Errore durante signInWithPassword:', error);
        return { data, error };
      }

      console.log('✅ Login completato:', data.user?.id);
      
      // Pulisci i dati temporanei dopo login riuscito
      localStorage.removeItem('pendingUserData');
      
      // Assicurati che il profilo utente esista
      if (data.user) {
        await this.ensureUserProfile(data.user);
      }
      
      return { data, error };
      
    } catch (error: any) {
      console.error('💥 Errore completo in signInWithPassword:', error);
      return { data: null, error };
    }
  }

  static async signOut(): Promise<AuthResponse> {
    console.log('🚪 Avvio logout');
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      console.log('✅ Logout completato');
      // Pulisci tutti i dati temporanei
      localStorage.removeItem('pendingUserData');
      localStorage.removeItem('supabase.auth.token');
    } else {
      console.error('❌ Errore durante logout:', error);
    }
    
    return { data: null, error };
  }

  private static async ensureUserProfile(user: any): Promise<void> {
    try {
      console.log('📝 Controllo profilo per user:', user.id);
      
      // Controlla se il profilo esiste già
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        console.log('✅ Profilo già esistente');
        return;
      }

      // Recupera username dai dati salvati o dai metadati
      const pendingData = localStorage.getItem('pendingUserData');
      let username = 'User';
      
      if (pendingData) {
        const parsed = JSON.parse(pendingData);
        username = parsed.username || username;
      } else {
        username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
      }
      
      console.log('📝 Creazione profilo con username:', username);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: username,
          email: user.email
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
      } else {
        console.log('✅ Profilo creato con successo');
      }
    } catch (profileErr) {
      console.error('💥 Profile creation error:', profileErr);
    }
  }
}
