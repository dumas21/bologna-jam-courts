
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmailPage() {
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Stato loading aggiunto
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      console.log('🔍 URL completo:', window.location.href);
      console.log('🔍 Hash:', window.location.hash);

      // Prima controlla se esiste già una sessione
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        console.log('✅ Sessione già presente, redirect alla home');
        setSession(currentSession);
        setUser(currentSession.user);
        setError(null); // ✅ Reset errore
        setIsLoading(false); // ✅ Stop loading
        setTimeout(() => navigate("/", { replace: true }), 1000);
        return;
      }

      // GESTIONE MULTIPLA: Email confirmation, OTP, OAuth
      
      // Caso 1: OAuth redirect (da GitHub/Google)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('code') || urlParams.get('access_token')) {
        console.log('🔧 Rilevato OAuth redirect, Supabase gestirà automaticamente');
        setError(null); // ✅ Reset errore per OAuth
        setIsLoading(false); // ✅ Stop loading
        // Per OAuth, Supabase gestisce automaticamente il redirect
        return;
      }

      // Caso 2: Hash con token (magic link/OTP)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');

      if (access_token && refresh_token) {
        console.log('🔧 Token trovati nell\'hash, imposto sessione');
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            setError("Errore nella sessione: " + error.message);
            setIsLoading(false); // ✅ Stop loading on error
          } else if (data.session) {
            console.log('✅ Login completato con successo');
            setSession(data.session);
            setUser(data.session.user);
            setError(null); // ✅ Reset errore!
            setIsLoading(false); // ✅ Stop loading
            setTimeout(() => navigate("/", { replace: true }), 1000);
          } else {
            setError("Sessione non valida");
            setIsLoading(false); // ✅ Stop loading
          }
        } catch (err) {
          console.error('💥 Errore setSession:', err);
          setError("Errore durante l'impostazione della sessione");
          setIsLoading(false); // ✅ Stop loading
        }
      } else {
        console.warn("⚠️ Nessun token trovato in URL o hash");
        setError("Link non valido o token mancanti. Il link potrebbe essere stato scansionato dal provider email.");
        setIsLoading(false); // ✅ Stop loading
      }
    };

    // Listener auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state change:', event, session ? 'SESSION_PRESENTE' : 'NO_SESSION');
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Auth state change - SIGNED_IN rilevato');
        setSession(session);
        setUser(session.user);
        setError(null); // ✅ Reset errore se login riuscito
        setIsLoading(false); // ✅ Stop loading
        setTimeout(() => navigate("/", { replace: true }), 1000);
      }
    });

    handleAuth();

    return () => {
      subscription.unsubscribe();
    };
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
