
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export async function signUp(email: string, password: string, username: string) {
  // Use the production domain for email redirects
  const redirectUrl = window.location.hostname.includes('lovableproject.com') 
    ? 'https://bologna-jam-courts.lovable.app/confirm-email'
    : `${window.location.origin}/confirm-email`;
    
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { username },
    },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export class AuthService {
  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false } = signUpData;
      
      console.log('🚀 Avvio registrazione con:', { email, username, newsletter });

      const { data, error } = await signUp(email, password, username);

      if (error) {
        console.error('❌ Errore durante registrazione:', error);
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
      
      const { data, error } = await signIn(email.trim(), password);

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
    console.log('🚪 Avvio logout');
    
    try {
      // Prima prova il logout normale di Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Errore durante logout Supabase:', error);
      } else {
        console.log('✅ Logout Supabase completato');
      }
      
      // Pulisci manualmente il localStorage come backup
      console.log('🧹 Pulizia localStorage...');
      try {
        // Rimuovi tutte le chiavi relative a Supabase
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('supabase.') || 
            key.includes('auth-token') || 
            key.includes('sb-') ||
            key === 'supabase-auth-token'
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('🗑️ Rimossa chiave:', key);
        });
        
        // Pulisci anche sessionStorage
        sessionStorage.clear();
        console.log('🧹 Pulizia sessionStorage completata');
        
      } catch (storageError) {
        console.error('⚠️ Errore pulizia storage:', storageError);
      }
      
      // Forza il refresh della sessione
      window.location.reload();
      
      return { data: null, error };
      
    } catch (err: any) {
      console.error('💥 Errore completo logout:', err);
      
      // Se tutto fallisce, pulisci tutto e ricarica
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      } catch (e) {
        console.error('💥 Errore critico:', e);
      }
      
      return { data: null, error: err };
    }
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
