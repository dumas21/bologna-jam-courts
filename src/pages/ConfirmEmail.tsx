
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmailPage() {
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setError("Errore durante il recupero della sessione.");
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user);
        // Redirect dopo 2 secondi
        setTimeout(() => navigate("/", { replace: true }), 2000);
      } else {
        // Prova a estrarre token dalla URL (hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (!access_token || !refresh_token) {
          setError("Token mancante o link non valido.");
          return;
        }

        // Imposta i token
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setError("Errore durante il login automatico.");
          return;
        }

        setSession(data.session);
        setUser(data.session?.user);
        setTimeout(() => navigate("/", { replace: true }), 2000);
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">{error ? "ERRORE" : "Benvenuto!"}</h1>
        
        {error && (
          <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg mb-4">
            <p className="font-medium">Errore:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!error && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-700">Accesso in corso...</p>
          </div>
        )}

        <hr className="my-4" />

        <div className="text-left">
          <h3 className="font-bold mb-2">AUTH DEBUG</h3>
          <p><strong>Session:</strong> {session ? "PRESENTE" : "ASSENTE"}</p>
          <p><strong>User:</strong> {user ? "PRESENTE" : "ASSENTE"}</p>
          <p><strong>Expires:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString('it-IT') : "—"}</p>
          <p><strong>Error:</strong> {error ?? "NESSUNO"}</p>
        </div>

        <div className="mt-4">
          <button
            onClick={() => navigate('/auth')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Torna al login
          </button>
        </div>
      </div>
    </div>
  );
}
