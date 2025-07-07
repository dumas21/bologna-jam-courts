
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
      try {
        console.log('🔍 URL completa:', window.location.href);
        console.log('🔍 Parametri URL:', Object.fromEntries(searchParams.entries()));
        
        // Estrai i parametri necessari dall'URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        console.log('🔍 Token hash:', token_hash);
        console.log('🔍 Type:', type);

        if (!token_hash || !type) {
          console.error('❌ Parametri mancanti:', { token_hash, type });
          toast({
            title: "Link non valido",
            description: "Il link di conferma non è valido o è incompleto.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        console.log('🔄 Verifica del token in corso...');
        
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any
        });

        if (error) {
          console.error('❌ Errore verifica:', error);
          toast({
            title: "Errore di verifica",
            description: error.message.includes('expired') 
              ? "Il link è scaduto. Richiedi una nuova email di conferma."
              : "Errore nella verifica dell'email. Riprova.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        if (data.user) {
          console.log('✅ Email confermata per utente:', data.user.id);
          
          toast({
            title: "EMAIL CONFERMATA!",
            description: "Account attivato con successo. Ora puoi accedere.",
          });
          
          // Vai sempre al login dopo la conferma
          navigate('/login', { 
            replace: true,
            state: { 
              emailVerified: true, 
              email: data.user.email,
              message: 'Account confermato! Inserisci le tue credenziali per accedere.' 
            }
          });
        }

      } catch (error) {
        console.error('💥 Errore imprevisto:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la verifica.",
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
          VERIFICA EMAIL IN CORSO...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Conferma della tua registrazione...</p>
      </div>
    </div>
  );
};

export default ConfirmEmail;
