import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthApiError } from '@supabase/supabase-js';

export default function ConfirmEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleConfirm = async () => {
      setIsLoading(true);
      
      try {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);

        const redirectToApp = () => {
          if (hash.includes('access_token') || hash.includes('refresh_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          navigate('/', { replace: true });
        };

        // 1) Flusso HASH (Token/Magic Link): PRIORITARIO
        if (hash.includes('access_token') && hash.includes('refresh_token')) {
          const params = new URLSearchParams(hash.replace('#', ''));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            redirectToApp();
            return;
          }
        }

        // 2) Flusso CODE (PKCE / Confirm Email):
        const hasCode = searchParams.get('code');
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(hasCode);
          if (error) throw error;
          redirectToApp();
          return;
        }

        // 3) Fallback: Controlla se l'utente ha già una sessione valida:
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          redirectToApp();
          return;
        }

        setError('Sessione non trovata: link non valido o scaduto.');

      } catch (e) {
        console.error(e);
        let errorMessage = 'Errore durante la conferma. Riprova dalla pagina di login.';

        if (e instanceof AuthApiError) {
          errorMessage = `Autenticazione fallita: ${e.message}`;
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    handleConfirm();
  }, [navigate]);

  return (
    <div 
      className="flex items-center justify-center min-h-screen p-4"
      style={{ 
        backgroundColor: '#000033', 
        backgroundImage: 'repeating-linear-gradient(0deg, #000 0, #000033 1px, #000 1px)', 
        backgroundSize: '100% 2px' 
      }}
    >
      <div className="bg-[#0A1A2A]/90 backdrop-blur-sm p-8 rounded-lg text-center max-w-md w-full border-2 border-primary shadow-[0_0_20px_rgba(231,52,161,0.5)]">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#1E90FF] arcade-text">
          BOOM SHAKALAKA!
        </h1>
        
        {isLoading ? (
          <div className="mb-4">
            <div className="h-12 w-12 mx-auto mb-4 bg-yellow-400 p-2 transform rotate-45 border-4 border-black animate-pulse"></div>
            <p className="text-gray-200 font-mono">LOADING...</p>
          </div>
        ) : error ? (
          <div className="mt-4 p-4 bg-red-800/20 border border-red-600 rounded-lg mb-4 shadow-xl">
            <p className="text-red-400 mb-3 font-mono break-words">{error}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="w-full bg-primary text-white py-3 px-6 rounded hover:bg-primary/90 transition-colors font-semibold shadow-2xl mt-4"
            >
              Torna al login
            </button>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-green-800/20 border border-green-600 rounded-lg mb-4 shadow-xl">
            <p className="text-green-400 font-mono">Accesso Confermato. Inizio Partita...</p>
          </div>
        )}
      </div>
    </div>
  );
}