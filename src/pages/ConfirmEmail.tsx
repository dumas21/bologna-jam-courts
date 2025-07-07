
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
      const token_hash = searchParams.get('token_hash') || 
                        new URLSearchParams(window.location.hash.substring(1)).get('token_hash');

      if (!token_hash) {
        toast({
          title: "Errore di verifica",
          description: "Token mancante nell'URL. Il link di conferma potrebbe essere malformato o scaduto.",
          variant: "destructive"
        });
        // SEMPRE AL LOGIN, MAI ALLA REGISTRAZIONE
        return navigate('/login');
      }

      try {
        console.log('🔍 Verifica token:', token_hash);

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        });

        if (error) {
          console.error('❌ Errore verifica OTP:', error);
          throw error;
        }

        console.log('✅ Token verificato con successo');

        // Attendi un momento per permettere al sistema di processare
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "EMAIL CONFERMATA!",
          description: "Il tuo account è stato attivato. Ora puoi accedere con email e password.",
        });
        
        // REDIRECT SEMPRE AL LOGIN DOPO CONFERMA EMAIL
        navigate('/login', { 
          replace: true,
          state: { 
            emailVerified: true, 
            message: 'Account confermato! Inserisci le tue credenziali per accedere.' 
          }
        });

      } catch (error) {
        console.error('💥 Errore durante verifica:', error);
        let errorMessage = 'Errore durante la verifica dell\'account.';
        
        if (error instanceof Error) {
          if (error.message.includes('expired')) {
            errorMessage = 'Il link di conferma è scaduto. Richiedi una nuova email di conferma.';
          } else if (error.message.includes('invalid')) {
            errorMessage = 'Il link di conferma non è valido. Controlla che sia completo.';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: "Errore di verifica",
          description: errorMessage,
          variant: "destructive"
        });
        
        // ANCHE IN CASO DI ERRORE, VAI AL LOGIN (non alla registrazione)
        navigate('/login');
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center max-w-md w-full">
        <h1 className="text-xl font-bold text-white mb-4 nike-text">
          VERIFICA EMAIL IN CORSO...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Conferma della tua registrazione...</p>
      </div>
    </div>
  );
};

export default ConfirmEmail;
