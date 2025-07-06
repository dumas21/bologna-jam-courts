
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
        
        // Controlla se l'utente è già autenticato
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔍 Sessione corrente:', currentSession ? 'PRESENTE' : 'ASSENTE');
        
        if (currentSession) {
          console.log('✅ Utente già autenticato, redirect alla home');
          setStatus("verified");
          setMessage("Account già verificato! Reindirizzamento in corso...");
          
          toast({
            title: "ACCOUNT GIÀ VERIFICATO!",
            description: "Sei già connesso. Benvenuto nel PlaygroundJam!",
          });
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
          return;
        }

        // Prova diversi modi per ottenere i parametri
        let token_hash = null;
        let type = null;

        // Metodo 1: dalla query string
        token_hash = searchParams.get('token_hash');
        type = searchParams.get('type');

        // Metodo 2: dall'hash se non trovati nella query
        if (!token_hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          token_hash = hashParams.get('token_hash');
          type = hashParams.get('type');
        }

        // Metodo 3: parsing manuale dell'URL per casi edge
        if (!token_hash) {
          const url = window.location.href;
          const tokenMatch = url.match(/[?&#]token_hash=([^&]+)/);
          const typeMatch = url.match(/[?&#]type=([^&]+)/);
          
          if (tokenMatch) token_hash = decodeURIComponent(tokenMatch[1]);
          if (typeMatch) type = decodeURIComponent(typeMatch[1]);
        }

        console.log('🔍 Parametri trovati:', { 
          token_hash: token_hash ? 'PRESENTE' : 'ASSENTE', 
          type: type || 'signup',
          searchParams: Object.fromEntries(searchParams.entries()),
          fullUrl: window.location.href
        });

        if (!token_hash) {
          console.error('❌ Token hash mancante in tutti i metodi di parsing');
          setStatus("error");
          setMessage("Token mancante nell'URL. Il link potrebbe essere malformato o scaduto.");
          return;
        }

        console.log('🔄 Verifico token con verifyOtp...');
        
        // Usa verifyOtp per confermare il token hash
        const { data, error } = await supabase.auth.verifyOtp({ 
          token_hash, 
          type: (type as "signup" | "recovery") || "signup"
        });

        console.log('📋 Risultato verifyOtp:', { data, error });

        if (error) {
          console.error('❌ Errore durante verifyOtp:', error);
          setStatus("error");
          setMessage(`Errore durante la verifica: ${error.message}`);
          return;
        }

        // Forza il refresh della sessione
        console.log('🔄 Controllo sessione dopo verifyOtp...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Errore nel recupero sessione:', sessionError);
        }

        console.log('📋 Sessione dopo verifyOtp:', session ? 'PRESENTE' : 'ASSENTE');

        if (session && session.user) {
          console.log('✅ Verifica completata con successo:', session.user.id);
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
          console.log('⚠️ Verifica completata ma sessione non disponibile, provo a recuperarla...');
          
          // Attendi un po' e riprova
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              console.log('✅ Sessione recuperata al secondo tentativo');
              navigate('/', { replace: true });
            } else {
              console.log('ℹ️ Sessione ancora non disponibile, reindirizzo al login');
              setStatus("verified");
              setMessage("Verifica completata! Ora puoi effettuare il login.");
              
              toast({
                title: "EMAIL VERIFICATA!",
                description: "La tua email è stata confermata. Ora puoi effettuare il login.",
              });
              
              setTimeout(() => {
                navigate('/login', { replace: true });
              }, 2000);
            }
          }, 1000);
        }
        
      } catch (error) {
        console.error('💥 Errore imprevisto durante conferma email:', error);
        setStatus("error");
        setMessage("Si è verificato un errore imprevisto durante la verifica.");
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
