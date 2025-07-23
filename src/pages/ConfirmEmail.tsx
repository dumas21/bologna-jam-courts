
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmailPage() {
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      console.log('🔍 ConfirmEmail - Gestione token dalla URL');
      console.log('🔍 URL:', window.location.href);
      
      // Leggi i token da query parameters (non hash)
      const urlParams = new URLSearchParams(window.location.search);
      const access_token = urlParams.get('access_token');
      const refresh_token = urlParams.get('refresh_token');

      if (access_token && refresh_token) {
        console.log('🔐 Trovati access_token e refresh_token nei query parameters');

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error('❌ Errore setSession:', error);
          setError('Errore nel salvataggio della sessione: ' + error.message);
          setIsLoading(false);
          return;
        }

        console.log('✅ Login completato con successo');
        setSession(data.session);
        setUser(data.session.user);
        setError(null);
        setIsLoading(false);
        navigate('/', { replace: true });
      } else {
        console.warn('❌ Token assenti nell\'URL (query parameters)');
        setError('Link di conferma non valido o scaduto');
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">
          {error ? "⚠️ ERRORE" : session && user ? "✅ BENVENUTO!" : "🔄 ACCESSO IN CORSO..."}
        </h1>
        
        {/* Messaggio di errore solo se errore E non in loading */}
        {error && !isLoading && (
          <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg mb-4">
            <p className="font-medium">Errore:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading solo se in caricamento E nessun errore E nessuna sessione */}
        {isLoading && !error && !session && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-700">Elaborazione autenticazione...</p>
          </div>
        )}

        {/* Successo se sessione presente E nessun errore */}
        {session && user && !error && (
          <div className="mb-4">
            <div className="text-green-600 text-4xl mb-2">✅</div>
            <p className="text-green-700 font-medium">Accesso completato con successo!</p>
            <p className="text-gray-600 text-sm">Reindirizzamento alla home...</p>
          </div>
        )}

        <hr className="my-4" />

        <div className="text-left">
          <h3 className="font-bold mb-2">AUTH DEBUG</h3>
          <p><strong>Session:</strong> {session ? "✅ PRESENTE" : "❌ ASSENTE"}</p>
          <p><strong>User:</strong> {user ? "✅ PRESENTE" : "❌ ASSENTE"}</p>
          <p><strong>Loading:</strong> {isLoading ? "🔄 SÌ" : "✅ NO"}</p>
          <p><strong>Expires:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString('it-IT') : "—"}</p>
          <p><strong>Error:</strong> {error ?? "✅ NESSUNO"}</p>
        </div>

        {session && user && (
          <div className="mt-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
                navigate('/auth', { replace: true });
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}

        {(!session || !user) && (
          <div className="mt-4">
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Torna al login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
