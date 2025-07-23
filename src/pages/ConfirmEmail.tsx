import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmail() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // Aspetta che Supabase gestisca automaticamente il token
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/', { replace: true });
        } else if (event === 'SIGNED_OUT') {
          setError('Accesso non riuscito, effettua di nuovo il login');
        }
      });

      // Forza refresh session (utile se si arriva con token in URL)
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError('Errore sessione: ' + error.message);
      } else if (!data.session) {
        setError('Sessione non trovata, link scaduto o non valido');
      }
    };

    handleAuth();
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