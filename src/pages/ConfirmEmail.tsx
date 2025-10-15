import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmail() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleConfirm = async () => {
      try {
        // 1) Gestione token nell'hash (access_token/refresh_token)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token') && hash.includes('refresh_token')) {
          const params = new URLSearchParams(hash.replace('#', ''));
          const access_token = params.get('access_token') || '';
          const refresh_token = params.get('refresh_token') || '';

          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            if (data.session) {
              navigate('/', { replace: true });
              return;
            }
          }
        }

        // 2) Gestione del codice in query (PKCE/email confirm)
        const searchParams = new URLSearchParams(window.location.search);
        const hasCode = searchParams.get('code');
        if (hasCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(hasCode);
          if (error) throw error;
          if (data.session) {
            navigate('/', { replace: true });
            return;
          }
        }

        // 3) Fallback: verifica sessione esistente
        const { data: sessionData, error: getErr } = await supabase.auth.getSession();
        if (getErr) throw getErr;
        if (sessionData.session) {
          navigate('/', { replace: true });
          return;
        }

        setError('Sessione non trovata: link non valido o scaduto.');
      } catch (e: any) {
        setError(e?.message || 'Errore durante la conferma.');
      }
    };

    handleConfirm();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Conferma Email</h1>
        {error ? (
          <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg mb-4">
            <p style={{ color: 'red' }}>{error}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Torna al login
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Verifica in corso...</p>
          </div>
        )}
      </div>
    </div>
  );
}