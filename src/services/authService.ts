
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false } = signUpData;

      const redirectTo = `${window.location.origin}/confirm-email`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { username },
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
      
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      if (error) {
        return { data, error };
      }
      
      // Assicurati che il profilo esista
      if (data.user) {
        await this.ensureUserProfile(data.user);
      }
      
      return { data, error };
      
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async signOut(): Promise<AuthResponse> {
    try {
      // Prima prova il logout normale di Supabase
      await supabase.auth.signOut({
        scope: 'global'
      });
    } catch (err) {
      // Continua con la pulizia anche se il logout Supabase fallisce
    }
    
    // Pulizia aggressiva di tutto lo storage
    try {
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
    } catch (storageError) {
      // Ignora errori di storage
    }
    
    // Pulisci anche i cookie di autenticazione se presenti
    try {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    } catch (cookieError) {
      // Ignora errori di cookie
    }
    
    // Aspetta un momento e poi ricarica
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
    return { data: null, error: null };
  }

  private static async ensureUserProfile(user: any): Promise<void> {
    try {
      // Controlla se il profilo esiste già
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        return;
      }

      // Recupera username dai metadati o fallback
      let username = user.user_metadata?.username || user.user_metadata?.display_name;
      
      if (!username) {
        username = user.email?.split('@')[0] || 'User';
      }
      
      // Crea il profilo
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: username,
          email: user.email
        }, {
          onConflict: 'id'
        });
    } catch (profileErr) {
      // Ignora errori nella creazione del profilo
    }
  }
}
