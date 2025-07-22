
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false } = signUpData;
      
      console.log('🚀 Avvio registrazione con:', { email, username, newsletter });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://bologna-jam-courts.lovable.app/confirm-email',
          data: { username },
        },
      });

      if (error) {
        console.error("Errore registrazione:", error.message);
        throw error;
      }

      console.log('✅ Registrazione Supabase completata:', data.user?.id);

      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email di conferma inviata a:', email);
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
        password 
      });

      if (error) {
        console.error('❌ Errore durante login:', error);
        return { data, error };
      }

      console.log('✅ Login completato con successo:', data.user?.id);
      
      // Assicurati che il profilo esista
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
    console.log('🚪 Avvio logout completo');
    
    try {
      // Prima prova il logout normale di Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Forza logout globale
      });
      
      if (error) {
        console.error('❌ Errore durante logout Supabase:', error);
      } else {
        console.log('✅ Logout Supabase completato');
      }
      
    } catch (err) {
      console.error('💥 Errore logout Supabase:', err);
    }
    
    // Pulizia aggressiva di tutto lo storage
    console.log('🧹 Pulizia completa storage...');
    try {
      // Lista tutte le chiavi di localStorage
      const allKeys = Object.keys(localStorage);
      console.log('🔍 Chiavi trovate:', allKeys);
      
      // Rimuovi TUTTE le chiavi (pulizia aggressiva)
      localStorage.clear();
      sessionStorage.clear();
      
      // Pulizia extra per chiavi specifiche di Supabase
      const supabaseKeys = [
        'supabase.auth.token',
        'sb-mpflsxdvvvajzkiyuiur-auth-token',
        'supabase.session',
        'auth-token'
      ];
      
      supabaseKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      console.log('🧹 Pulizia storage completata');
      
    } catch (storageError) {
      console.error('⚠️ Errore pulizia storage:', storageError);
    }
    
    // Pulisci anche i cookie di autenticazione se presenti
    try {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('🍪 Cookie puliti');
    } catch (cookieError) {
      console.error('⚠️ Errore pulizia cookie:', cookieError);
    }
    
    console.log('🔄 Forzo ricarica pagina...');
    
    // Aspetta un momento e poi ricarica
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
    return { data: null, error: null };
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

      // Recupera username dai metadati o fallback
      let username = user.user_metadata?.username || user.user_metadata?.display_name;
      
      if (!username) {
        username = user.email?.split('@')[0] || 'User';
      }
      
      console.log('📝 Creazione profilo con username:', username);
      
      // Crea il profilo
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
}
