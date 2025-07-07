import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  // Conserva i dati per 10 anni
  private static readonly DATA_RETENTION_TIME = 10 * 365 * 24 * 60 * 60 * 1000;

  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false } = signUpData;
      
      console.log('🚀 Avvio registrazione con:', { email, username, newsletter });

      // URL di redirect corretto con parametri aggiuntivi per debug
      const redirectUrl = `${window.location.origin}/auth/confirm`;
      console.log('🔗 URL di redirect:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username,
            display_name: username
          }
        }
      });

      if (error) {
        console.error('❌ Errore durante registrazione:', error);
        throw error;
      }

      console.log('✅ Registrazione Supabase completata:', data.user?.id);

      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email di conferma inviata a:', email);
        
        // Salva i dati per 10 anni con timestamp per debug
        const userData = {
          email,
          password, // Salva temporaneamente per il primo login
          username,
          userId: data.user.id,
          registrationDate: Date.now(),
          expiryDate: Date.now() + this.DATA_RETENTION_TIME,
          confirmed: false,
          lastEmailSent: Date.now() // Traccia quando è stata inviata l'ultima email
        };
        
        // Salva sia come pendingUserData che come credenziali permanenti
        localStorage.setItem('pendingUserData', JSON.stringify(userData));
        localStorage.setItem(`userCredentials_${email}`, JSON.stringify(userData));
        console.log('💾 Dati utente salvati per 10 anni');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Errore completo in registrazione:', error);
      return { data: null, error };
    }
  }

  static async resendConfirmationEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('📧 Reinvio email di conferma per:', email);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) {
        console.error('❌ Errore reinvio email:', error);
        return { data, error };
      }

      // Aggiorna il timestamp dell'ultimo invio
      const savedData = localStorage.getItem(`userCredentials_${email}`);
      if (savedData) {
        const userData = JSON.parse(savedData);
        userData.lastEmailSent = Date.now();
        localStorage.setItem(`userCredentials_${email}`, JSON.stringify(userData));
        
        // Aggiorna anche i dati pending se esistono
        const pendingData = localStorage.getItem('pendingUserData');
        if (pendingData) {
          const pendingUserData = JSON.parse(pendingData);
          if (pendingUserData.email === email) {
            pendingUserData.lastEmailSent = Date.now();
            localStorage.setItem('pendingUserData', JSON.stringify(pendingUserData));
          }
        }
      }

      console.log('✅ Email di conferma reinviata con successo');
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Errore reinvio email:', error);
      return { data: null, error };
    }
  }

  static async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Tentativo di login con email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('❌ Errore durante login:', error);
        return { data, error };
      }

      console.log('✅ Login completato con successo:', data.user?.id);
      
      // Assicura che il profilo esista
      if (data.user) {
        await this.ensureUserProfile(data.user);
        
        // Aggiorna i dati salvati
        const savedData = localStorage.getItem(`userCredentials_${email}`);
        if (savedData) {
          const userData = JSON.parse(savedData);
          userData.confirmed = true;
          userData.lastLogin = Date.now();
          // Rimuovi la password dopo il primo login riuscito
          delete userData.password;
          localStorage.setItem(`userCredentials_${email}`, JSON.stringify(userData));
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

      // Recupera username dai dati salvati o dai metadati
      let username = 'User';
      
      // Prima prova dai metadati utente
      if (user.user_metadata?.username) {
        username = user.user_metadata.username;
      } else if (user.user_metadata?.display_name) {
        username = user.user_metadata.display_name;
      } else {
        // Poi prova dai dati salvati localmente
        const savedData = localStorage.getItem(`userCredentials_${user.email}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.expiryDate && Date.now() < parsed.expiryDate) {
            username = parsed.username || username;
          }
        }
      }
      
      if (username === 'User') {
        username = user.email?.split('@')[0] || 'User';
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

  // Metodi di utilità aggiornati
  static getSavedCredentials(email: string): any {
    const savedData = localStorage.getItem(`userCredentials_${email}`);
    return savedData ? JSON.parse(savedData) : null;
  }

  static getPendingUserData(): any {
    const pendingData = localStorage.getItem('pendingUserData');
    return pendingData ? JSON.parse(pendingData) : null;
  }

  static cleanupExpiredData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('userCredentials_')) {
        const data = localStorage.getItem(key);
        if (data) {
          const userData = JSON.parse(data);
          if (userData.expiryDate && Date.now() > userData.expiryDate) {
            localStorage.removeItem(key);
            console.log('🧹 Dati scaduti rimossi per:', key);
          }
        }
      }
    });
  }
}
