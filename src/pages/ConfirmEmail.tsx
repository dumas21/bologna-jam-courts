
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "verified" | "error">("loading");
  const [message, setMessage] = useState("Verifica in corso...");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const url = new URL(window.location.href);
        const token_hash = url.searchParams.get("token_hash");
        const type = (url.searchParams.get("type") || "signup") as "signup" | "recovery";

        console.log('🔍 Parametri URL per conferma:', { token_hash: token_hash ? 'PRESENTE' : 'ASSENTE', type });

        if (!token_hash) {
          console.error('❌ Token hash mancante nell\'URL');
          setStatus("error");
          setMessage("Token mancante o link non valido.");
          return;
        }

        console.log('🔄 Verifico token con verifyOtp...');
        
        // Usa verifyOtp per confermare il token hash
        const { data, error } = await supabase.auth.verifyOtp({ 
          token_hash, 
          type 
        });

        if (error) {
          console.error('❌ Errore durante verifyOtp:', error);
          setStatus("error");
          setMessage(error.message);
          return;
        }

        if (data?.user && data?.session) {
          console.log('✅ Verifica completata con successo:', data.user.id);
          setStatus("verified");
          setMessage("Account verificato! Reindirizzamento in corso...");
          
          toast({
            title: "ACCOUNT VERIFICATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto nel PlaygroundJam!",
          });
          
          // Attendi un secondo e reindirizza alla home
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          console.error('❌ Dati utente o sessione mancanti dopo verifyOtp');
          setStatus("error");
          setMessage("Errore durante la verifica dell'account.");
        }
        
      } catch (error) {
        console.error('💥 Errore imprevisto durante conferma email:', error);
        setStatus("error");
        setMessage("Si è verificato un errore imprevisto durante la verifica.");
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold text-white mb-4 nike-text">
              VERIFICA ACCOUNT...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">{message}</p>
          </>
        )}
        
        {status === "verified" && (
          <>
            <h1 className="text-xl font-bold text-green-400 mb-4 nike-text">
              ACCOUNT VERIFICATO!
            </h1>
            <p className="text-green-300 mb-4">{message}</p>
            <div className="animate-pulse text-purple-300">
              Reindirizzamento alla home...
            </div>
          </>
        )}
        
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-400 mb-4 nike-text">
              ERRORE VERIFICA
            </h1>
            <p className="text-red-300 mb-2">Errore durante la verifica:</p>
            <p className="text-red-400 mb-6">{message}</p>
            <button
              className="arcade-button arcade-button-primary w-full mb-3"
              onClick={() => navigate('/register')}
            >
              TORNA ALLA REGISTRAZIONE
            </button>
            <button
              className="arcade-button arcade-button-secondary w-full"
              onClick={() => navigate('/login')}
            >
              VAI AL LOGIN
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
