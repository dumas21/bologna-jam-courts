
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, AuthResponse } from '@/types/auth';

export class AuthService {
  static async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, username, newsletter = false, privacyVersion = '1.0' } = signUpData;
      
      console.log('Avvio signUp con:', { email, username, newsletter });

      // ④ CRITICO: emailRedirectTo deve puntare alla callback
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username
          }
        }
      });

      if (error) {
        console.error('Errore durante signUp:', error);
        throw error;
      }

      console.log('SignUp completato:', data);

      if (data.user) {
        await this.updateUserProfile(data.user.id, username);
        
        if (newsletter) {
          await this.saveNewsletterConsent(data.user.id, email, privacyVersion);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Errore completo in signUp:', error);
      return { data: null, error };
    }
  }

  static async signInWithUsername(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Tentativo di login con username:', username);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('nickname', username)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('Username non trovato:', profileError);
        return { data: null, error: { message: 'Username non trovato' } };
      }

      console.log('Email trovata per username:', profileData.email);

      // Use the correct Supabase v2 API
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: password
      });

      if (error) {
        console.error('Errore durante login:', error);
      } else {
        console.log('Login completato:', data);
      }

      return { data, error };
    } catch (error: any) {
      console.error('Errore completo in signInWithUsername:', error);
      return { data: null, error };
    }
  }

  static async signInWithMagicLink(email: string, username: string): Promise<AuthResponse> {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username
        }
      }
    });

    return { data: null, error };
  }

  static async signOut(): Promise<AuthResponse> {
    console.log('Avvio logout');
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      console.log('Logout completato');
    } else {
      console.error('Errore durante logout:', error);
    }
    
    return { data: null, error };
  }

  private static async updateUserProfile(userId: string, username: string): Promise<void> {
    try {
      console.log('Aggiornamento profilo per user:', userId);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nickname: username
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      } else {
        console.log('Profilo aggiornato con successo');
      }
    } catch (profileErr) {
      console.error('Profile update error:', profileErr);
    }
  }

  private static async saveNewsletterConsent(userId: string, email: string, privacyVersion: string): Promise<void> {
    try {
      console.log('Salvataggio consenso newsletter');
      
      const { error: newsletterError } = await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_event_type: 'newsletter_consent',
        p_event_data: {
          email: email,
          consented: true,
          consented_at: new Date().toISOString(),
          privacy_version: privacyVersion
        }
      });

      if (newsletterError) {
        console.error('Error saving newsletter consent:', newsletterError);
      } else {
        console.log('Consenso newsletter salvato');
      }
    } catch (e) {
      console.error('Newsletter consent error:', e);
    }
  }
}
