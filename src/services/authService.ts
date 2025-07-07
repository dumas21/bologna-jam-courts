
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  // Conserva i dati per 10 anni (in millisecondi)
  private static readonly DATA_RETENTION_TIME = 10 * 365 * 24 * 60 * 60 * 1000;

  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false, privacyVersion = '1.0' } = signUpData;
      
      console.log('🚀 Avvio registrazione con:', { email, username, newsletter });

      // URL di redirect preciso per la conferma email
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/auth/confirm`;
      console.log('🔗 URL di redirect impostato:', redirectUrl);

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

      console.log('✅ Registrazione completata:', data.user?.id);

      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email di conferma inviata a:', email);
        
        // SALVA I DATI PER 10 ANNI - QUESTO È FONDAMENTALE
        const userData = {
          email,
          password, // Salviamo temporaneamente per il primo login
          username,
          userId: data.user.id,
          registrationDate: Date.now(),
          expiryDate: Date.now() + this.DATA_RETENTION_TIME,
          confirmed: false
        };
        
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

  static async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Tentativo di login con email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('❌ Errore durante login:', error);
        
        // Se l'errore è dovuto alla email non confermata, recupera i dati salvati
        if (error.message?.includes('Email not confirmed')) {
          const savedData = localStorage.getItem(`userCredentials_${email}`);
          if (savedData) {
            const userData = JSON.parse(savedData);
            console.log('📂 Dati utente trovati, ma email non confermata');
          }
        }
        
        return { data, error };
      }

      console.log('✅ Login completato con successo:', data.user?.id);
      
      // Recupera e aggiorna i dati salvati
      if (data.user) {
        await this.ensureUserProfile(data.user);
        
        // Marca come confermato nei dati salvati
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
      // NON cancellare i dati utente - devono rimanere per 10 anni
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

  // Metodo per recuperare credenziali salvate (per debugging)
  static getSavedCredentials(email: string): any {
    const savedData = localStorage.getItem(`userCredentials_${email}`);
    return savedData ? JSON.parse(savedData) : null;
  }

  // Metodo per pulire dati scaduti
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
