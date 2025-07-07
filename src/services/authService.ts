
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  // Conserva i dati per 10 anni (in millisecondi)
  private static readonly DATA_RETENTION_TIME = 10 * 365 * 24 * 60 * 60 * 1000;

  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false, privacyVersion = '1.0' } = signUpData;
      
      console.log('🚀 Avvio registrazione con:', { email, username, newsletter });

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
        console.error('❌ Errore durante registrazione:', error);
        throw error;
      }

      console.log('✅ Registrazione completata:', data.user?.id);

      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email di conferma inviata a:', email);
        
        // CONSERVA I DATI PER 10 ANNI
        const userData = {
          email,
          username,
          userId: data.user.id,
          registrationDate: Date.now(),
          expiryDate: Date.now() + this.DATA_RETENTION_TIME
        };
        
        localStorage.setItem('pendingUserData', JSON.stringify(userData));
        console.log('💾 Dati utente salvati per 10 anni');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Errore completo in registrazione:', error);
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
        console.error('❌ Errore durante login:', error);
        return { data, error };
      }

      console.log('✅ Login completato con successo:', data.user?.id);
      
      // Recupera i dati conservati e crea/aggiorna il profilo
      if (data.user) {
        await this.ensureUserProfile(data.user);
        
        // Aggiorna la data di ultimo accesso nei dati conservati
        const pendingData = localStorage.getItem('pendingUserData');
        if (pendingData) {
          const userData = JSON.parse(pendingData);
          userData.lastLogin = Date.now();
          localStorage.setItem('pendingUserData', JSON.stringify(userData));
        }
      }
      
      return { data, error };
      
    } catch (error: any) {
      console.error('💥 Errore completo in login:', error);
      return { data: null, error };
    }
  }

  static async signOut(): Promise<AuthResponse> {
    console.log('🚪 Avvio logout');
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      console.log('✅ Logout completato');
      // NON cancellare i dati utente - devono rimanere per 10 anni
      // localStorage.removeItem('pendingUserData'); // COMMENTATO
    } else {
      console.error('❌ Errore durante logout:', error);
    }
    
    return { data: null, error };
  }

  private static async ensureUserProfile(user: any): Promise<void> {
    try {
      console.log('📝 Controllo/creazione profilo per user:', user.id);
      
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

      // Recupera username dai dati conservati o dai metadati
      const pendingData = localStorage.getItem('pendingUserData');
      let username = 'User';
      
      if (pendingData) {
        const parsed = JSON.parse(pendingData);
        // Verifica che i dati non siano scaduti (controllo per 10 anni)
        if (parsed.expiryDate && Date.now() < parsed.expiryDate) {
          username = parsed.username || username;
          console.log('📂 Username recuperato dai dati conservati:', username);
        }
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
        console.error('❌ Errore creazione profilo:', profileError);
      } else {
        console.log('✅ Profilo creato con successo');
      }
    } catch (profileErr) {
      console.error('💥 Errore durante creazione profilo:', profileErr);
    }
  }

  // Metodo per verificare e pulire dati scaduti (eseguito raramente)
  static cleanupExpiredData(): void {
    const pendingData = localStorage.getItem('pendingUserData');
    if (pendingData) {
      const userData = JSON.parse(pendingData);
      if (userData.expiryDate && Date.now() > userData.expiryDate) {
        localStorage.removeItem('pendingUserData');
        console.log('🧹 Dati utente scaduti rimossi');
      }
    }
  }
}
