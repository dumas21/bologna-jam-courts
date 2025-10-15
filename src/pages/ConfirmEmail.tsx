import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmail() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleConfirm = async () => {
      try {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);

        // 1) Flusso HASH (Token/Magic Link): PRIORITARIO
        if (hash.includes('access_token') && hash.includes('refresh_token')) {
          const params = new URLSearchParams(hash.replace('#', ''));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            
            // Pulizia URL dopo il successo
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/', { replace: true });
            return;
          }
        }

        // 2) Flusso CODE (PKCE / Confirm Email):
        const hasCode = searchParams.get('code');
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(hasCode);
          if (error) throw error;
          navigate('/', { replace: true });
          return;
        }

        // 3) Fallback: Controlla se l'utente ha già una sessione valida:
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          navigate('/', { replace: true });
          return;
        }

        setError('Sessione non trovata: link non valido o scaduto.');

      } catch (e: any) {
        // Gestione errore centralizzata e robusta
        console.error(e); 
        setError(e?.message || 'Errore durante la conferma. Riprova dalla pagina di login.');
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
      <div className="bg-card/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl text-center max-w-md w-full border-2 border-primary/20">
        <h1 className="text-2xl font-bold mb-6 text-primary">Conferma Email</h1>
        {error ? (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <p className="text-destructive mb-3">{error}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Torna al login
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifica in corso...</p>
          </div>
        )}
      </div>
    </div>
  );
}