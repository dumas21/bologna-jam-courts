
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
        
        // Estrai parametri con metodi multipli per massima compatibilità
        let token_hash = null;
        let type = null;
        let access_token = null;
        let refresh_token = null;

        // Metodo 1: URL Search params
        token_hash = searchParams.get('token_hash');
        type = searchParams.get('type');
        access_token = searchParams.get('access_token');
        refresh_token = searchParams.get('refresh_token');

        // Metodo 2: Hash fragment (formato vecchio Supabase)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          token_hash = token_hash || hashParams.get('token_hash');
          type = type || hashParams.get('type');
          access_token = access_token || hashParams.get('access_token');
          refresh_token = refresh_token || hashParams.get('refresh_token');
        }

        // Metodo 3: Parsing manuale per catturare qualsiasi formato
        const fullUrl = window.location.href;
        if (!token_hash) {
          const tokenMatch = fullUrl.match(/[?&#]token_hash=([^&\s]+)/);
          if (tokenMatch) token_hash = decodeURIComponent(tokenMatch[1]);
        }
        if (!type) {
          const typeMatch = fullUrl.match(/[?&#]type=([^&\s]+)/);
          if (typeMatch) type = decodeURIComponent(typeMatch[1]);
        }

        console.log('🔍 Parametri estratti:', { 
          token_hash: token_hash ? 'PRESENTE (' + token_hash.substring(0, 10) + '...)' : 'ASSENTE', 
          type: type || 'ASSENTE',
          access_token: access_token ? 'PRESENTE' : 'ASSENTE',
          refresh_token: refresh_token ? 'PRESENTE' : 'ASSENTE'
        });

        // Se abbiamo access_token e refresh_token, usiamo setSession
        if (access_token && refresh_token) {
          console.log('🔄 Uso setSession con token esistenti...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) {
            console.error('❌ Errore setSession:', error);
            throw error;
          }

          if (data?.user) {
            console.log('✅ Sessione impostata con successo:', data.user.id);
            setStatus("verified");
            setMessage("Account verificato! Reindirizzamento in corso...");
            
            toast({
              title: "ACCOUNT VERIFICATO!",
              description: "Il tuo account è stato confermato con successo. Benvenuto!",
            });
            
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1500);
            return;
          }
        }

        // Se non abbiamo i token diretti, proviamo con verifyOtp
        if (!token_hash) {
          console.error('❌ Nessun token disponibile per la verifica');
          setStatus("error");
          setMessage("Token mancante nell'URL. Il link di conferma potrebbe essere malformato o scaduto.");
          return;
        }

        console.log('🧹 Pulizia sessioni esistenti...');
        await supabase.auth.signOut();
        
        // Attendi che la pulizia sia completata
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('🔄 Verifica token con verifyOtp...');
        
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
          } else if (error.message?.includes('invalid') || error.message?.includes('not found')) {
            setMessage("Link di conferma non valido. Controlla di aver cliccato il link corretto dalla tua email.");
          } else {
            setMessage(`Errore durante la verifica: ${error.message}`);
          }
          return;
        }

        // Attendi stabilizzazione della sessione
        console.log('⏳ Attendo stabilizzazione sessione...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verifica finale della sessione con retry
        let finalSession = null;
        for (let i = 0; i < 5; i++) {
          console.log(`🔄 Tentativo ${i + 1} di recupero sessione...`);
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Errore nel recupero sessione:', sessionError);
          } else if (session?.user) {
            finalSession = session;
            console.log('✅ Sessione recuperata:', session.user.id);
            break;
          }
          
          if (i < 4) await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (finalSession && finalSession.user) {
          console.log('✅ Verifica completata con successo per utente:', finalSession.user.id);
          setStatus("verified");
          setMessage("Account verificato! Reindirizzamento in corso...");
          
          toast({
            title: "ACCOUNT VERIFICATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto!",
          });
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          console.log('⚠️ Verifica completata ma sessione non disponibile');
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
            <div className="text-yellow-300 text-sm mb-6">
              <p className="mb-2">🔍 Debug Info:</p>
              <p>URL: {window.location.href.substring(0, 100)}...</p>
              <p>Params: {window.location.search || 'Nessuno'}</p>
              <p>Hash: {window.location.hash || 'Nessuno'}</p>
            </div>
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
