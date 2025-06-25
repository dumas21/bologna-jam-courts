
import { supabase } from "@/integrations/supabase/client";
import { sendConfirmationEmail } from "./emailService";

export const signUp = async (email: string, password: string, nickname: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Starting sign up process for:', email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          nickname: nickname
        }
      }
    });

    if (error) {
      console.error('Supabase signUp error:', error);
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return { success: false, error: 'User already registered' };
      }
      return { success: false, error: error.message };
    }

    console.log('SignUp response:', data);

    if (data.user && !data.session) {
      console.log('User created successfully, sending confirmation email...');
      
      // Invia email di conferma personalizzata
      const emailSent = await sendConfirmationEmail(email, data.user.id);
      
      if (!emailSent) {
        console.warn('Failed to send confirmation email, but user was created');
      } else {
        console.log('Confirmation email sent successfully');
      }
      
      return { success: true };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error in signUp:', error);
    return { success: false, error: error.message };
  }
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid login credentials' };
      } else if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Email not confirmed' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
