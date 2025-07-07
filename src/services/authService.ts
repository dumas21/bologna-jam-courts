
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false } = signUpData;
      
      console.log('🚀 Avvio registrazione con:', { email, username, newsletter });

      // URL di redirect CORRETTO
      const redirectUrl = `${window.location.origin}/confirm-email`;
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
        
        // Salva solo i dati essenziali
        const userData = {
          email,
          username,
          userId: data.user.id,
          registrationDate: Date.now()
        };
        
        localStorage.setItem('pendingUserData', JSON.stringify(userData));
        console.log('💾 Dati utente salvati');
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
        return { data, error };
      }

      console.log('✅ Login completato con successo:', data.user?.id);
      
      if (data.user) {
        await this.ensureUserProfile(data.user);
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
      localStorage.removeItem('pendingUserData');
    } else {
      console.error('❌ Errore durante logout:', error);
    }
    
    return { data: null, error };
  }

  private static async ensureUserProfile(user: any): Promise<void> {
    try {
      console.log('📝 Controllo/creazione profilo per user:', user.id);
      
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
      
      if (user.user_metadata?.username) {
        username = user.user_metadata.username;
      } else {
        const savedData = localStorage.getItem('pendingUserData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          username = parsed.username || username;
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
        localStorage.removeItem('pendingUserData');
      }
    } catch (profileErr) {
      console.error('💥 Errore durante creazione profilo:', profileErr);
    }
  }
}
