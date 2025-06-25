
import { supabase } from "@/integrations/supabase/client";

export const sendConfirmationEmail = async (email: string, userId: string) => {
  try {
    // Create a proper confirmation URL that Supabase can handle
    const confirmationUrl = `${window.location.origin}/auth/confirm?token_hash=${userId}&type=signup&redirect_to=${encodeURIComponent(window.location.origin)}`;
    
    console.log('Sending confirmation email to:', email);
    console.log('Confirmation URL:', confirmationUrl);
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email,
        confirmationUrl,
        token: userId
      }
    });

    if (error) {
      console.error('Error invoking send-confirmation-email function:', error);
      return false;
    }
    
    console.log('Confirmation email function response:', data);
    return true;
  } catch (error) {
    console.error('Error in sendConfirmationEmail:', error);
    return false;
  }
};
