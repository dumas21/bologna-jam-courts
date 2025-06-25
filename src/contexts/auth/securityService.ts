
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const logSecurityEvent = async (user: User | null, eventType: string, eventData?: any) => {
  if (!user) return;

  try {
    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_event_type: eventType,
      p_event_data: eventData || null,
      p_ip_address: null,
      p_user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
