import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';
import { z } from 'zod';

// Zod validation schemas for authentication
const signUpSchema = z.object({
  email: z.string()
    .email('Formato email non valido')
    .max(255, 'Email troppo lunga')
    .transform(val => val.trim().toLowerCase()),
  password: z.string()
    .min(8, 'La password deve essere di almeno 8 caratteri')
    .max(72, 'La password è troppo lunga')
    .regex(/[A-Z]/, 'La password deve contenere almeno una lettera maiuscola')
    .regex(/[a-z]/, 'La password deve contenere almeno una lettera minuscola')
    .regex(/[0-9]/, 'La password deve contenere almeno un numero'),
  username: z.string()
    .min(3, 'Il nome utente deve essere di almeno 3 caratteri')
    .max(50, 'Il nome utente è troppo lungo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Il nome utente può contenere solo lettere, numeri, trattini e underscore'),
  newsletter: z.boolean().optional(),
  privacyVersion: z.string().optional()
});

const signInSchema = z.object({
  email: z.string()
    .email('Formato email non valido')
    .max(255, 'Email troppo lunga')
    .transform(val => val.trim().toLowerCase()),
  password: z.string()
    .min(1, 'La password è obbligatoria')
    .max(72, 'La password è troppo lunga')
});

export class AuthService {
  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      // Validate input with Zod
      const validated = signUpSchema.parse(signUpData);

      const redirectTo = `${window.location.origin}/confirm-email`;

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectTo,
          data: { username: validated.username },
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
      
    } catch (error: any) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return { 
          data: null, 
          error: { 
            message: firstError.message,
            name: 'ValidationError',
            status: 400
          } 
        };
      }
      return { data: null, error };
    }
  }

  static async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate input with Zod
      const validated = signInSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: validated.email, 
        password: validated.password
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
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return { 
          data: null, 
          error: { 
            message: firstError.message,
            name: 'ValidationError',
            status: 400
          } 
        };
      }
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
