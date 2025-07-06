
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "verified" | "error">("loading");
  const [message, setMessage] = useState("Verifica in corso...");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 URL completo:', window.location.href);
        console.log('🔍 Search params:', window.location.search);
        console.log('🔍 Hash:', window.location.hash);
        
        // IMPORTANTE: Pulisci completamente lo stato di autenticazione
        console.log('🧹 Pulizia completa dello stato di autenticazione...');
        await supabase.auth.signOut();
        
        // Attendi che la pulizia sia completata
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Estrai parametri token con metodi multipli
        let token_hash = null;
        let type = null;

        // Metodo 1: Query string standard
        token_hash = searchParams.get('token_hash');
        type = searchParams.get('type');

        // Metodo 2: Hash fragment
        if (!token_hash && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          token_hash = hashParams.get('token_hash');
          type = hashParams.get('type');
        }

        // Metodo 3: Parsing manuale dell'URL completo
        if (!token_hash) {
          const url = window.location.href;
          const tokenMatch = url.match(/[?&#]token_hash=([^&]+)/);
          const typeMatch = url.match(/[?&#]type=([^&]+)/);
          
          if (tokenMatch) token_hash = decodeURIComponent(tokenMatch[1]);
          if (typeMatch) type = decodeURIComponent(typeMatch[1]);
        }

        // Metodo 4: Parsing dal hash con split
        if (!token_hash && window.location.hash.includes('token_hash=')) {
          const hashPart = window.location.hash.split('token_hash=')[1];
          if (hashPart) {
            token_hash = hashPart.split('&')[0];
          }
        }

        console.log('🔍 Parametri estratti:', { 
          token_hash: token_hash ? 'PRESENTE (' + token_hash.substring(0, 10) + '...)' : 'ASSENTE', 
          type: type || 'signup (default)'
        });

        if (!token_hash) {
          console.error('❌ Token hash completamente mancante');
          setStatus("error");
          setMessage("Token mancante nell'URL. Il link di conferma potrebbe essere malformato o scaduto.");
          return;
        }

        console.log('🔄 Verifica token con verifyOtp...');
        
        // Usa verifyOtp per confermare il token
        const { data, error } = await supabase.auth.verifyOtp({ 
          token_hash, 
          type: (type as any) || "signup"
        });

        console.log('📋 Risultato verifyOtp:', { 
          success: !error, 
          userId: data?.user?.id,
          sessionPresent: !!data?.session,
          error: error?.message 
        });

        if (error) {
          console.error('❌ Errore durante verifyOtp:', error);
          setStatus("error");
          if (error.message?.includes('expired')) {
            setMessage("Il link di conferma è scaduto. Richiedi una nuova conferma.");
          } else if (error.message?.includes('invalid')) {
            setMessage("Link di conferma non valido. Controlla di aver cliccato il link corretto.");
          } else {
            setMessage(`Errore durante la verifica: ${error.message}`);
          }
          return;
        }

        // Attendi stabilizzazione della sessione
        console.log('⏳ Attendo stabilizzazione sessione...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verifica finale della sessione
        let attempts = 0;
        let finalSession = null;
        
        while (attempts < 3 && !finalSession) {
          console.log(`🔄 Tentativo ${attempts + 1} di recupero sessione...`);
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Errore nel recupero sessione:', sessionError);
          } else if (session?.user) {
            finalSession = session;
            console.log('✅ Sessione recuperata:', session.user.id);
            break;
          }
          
          attempts++;
          if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (finalSession && finalSession.user) {
          console.log('✅ Verifica completata con successo per utente:', finalSession.user.id);
          setStatus("verified");
          setMessage("Account verificato! Reindirizzamento in corso...");
          
          toast({
            title: "ACCOUNT VERIFICATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto nel PlaygroundJam!",
          });
          
          // Redirect immediato alla home
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          console.log('⚠️ Verifica completata ma sessione non disponibile dopo 3 tentativi');
          setStatus("verified");
          setMessage("Email verificata! Ora puoi effettuare il login.");
          
          toast({
            title: "EMAIL VERIFICATA!",
            description: "La tua email è stata confermata. Ora puoi effettuare il login.",
          });
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
        
      } catch (error) {
        console.error('💥 Errore imprevisto durante conferma email:', error);
        setStatus("error");
        setMessage("Si è verificato un errore imprevisto durante la verifica. Riprova più tardi.");
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast, searchParams]);

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
              Reindirizzamento in corso...
            </div>
          </>
        )}
        
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-400 mb-4 nike-text">
              ERRORE VERIFICA
            </h1>
            <p className="text-red-300 mb-6">{message}</p>
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
