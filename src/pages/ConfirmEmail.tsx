
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // 1. Estrai il token da tutte le possibili posizioni
      const token_hash = searchParams.get('token_hash') || 
                        new URLSearchParams(window.location.hash.substring(1)).get('token_hash');

      if (!token_hash) {
        toast({
          title: "Errore di verifica",
          description: "Token mancante nell'URL",
          variant: "destructive"
        });
        return navigate('/register');
      }

      try {
        // 2. Verifica l'OTP con timeout
        const { error } = await Promise.race([
          supabase.auth.verifyOtp({
            token_hash,
            type: 'signup'
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout verificato')), 5000)
          )
        ]);

        if (error) throw error;

        // 3. Workaround CRUCIALE: Attendi e forza la sessione
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          // Ultimo tentativo: login forzato via API
          const email = searchParams.get('email');
          if (email) {
            await supabase.auth.signInWithOtp({
              email,
              options: { emailRedirectTo: window.location.origin }
            });
          }
          throw new Error('Sessione non creata');
        }

        // 4. Salvataggio manuale nel localStorage
        const projectId = 'mpflsxdvvvajzkiyuiur'; // Using the actual project ID from client.ts
        localStorage.setItem(
          `sb-${projectId}-auth-token`,
          JSON.stringify({
            currentSession: session,
            expiresAt: session.expires_at
          })
        );

        // 5. Toast di successo
        toast({
          title: "Email verificata!",
          description: "Il tuo account è stato confermato con successo.",
        });

        // 6. Redirect con stato
        navigate('/', { 
          replace: true,
          state: { emailVerified: true } 
        });

      } catch (error) {
        console.error('Errore completo:', error);
        toast({
          title: "Errore di verifica",
          description: error instanceof Error ? error.message : 'Errore sconosciuto',
          variant: "destructive"
        });
        navigate('/login');
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center max-w-md w-full">
        <h1 className="text-xl font-bold text-white mb-4 nike-text">
          VERIFICA ACCOUNT...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Verifica in corso...</p>
      </div>
    </div>
  );
};

export default ConfirmEmail;
