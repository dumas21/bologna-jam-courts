import { supabase } from '@/integrations/supabase/client';

export async function signUp(email: string, password: string, username: string) {
  const redirectUrl = 'https://bologna-jam-courts.lovable.app/confirm-email';

  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { username },
    },
  });
}