import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Conferma in corso...');
  const [error, setError] = useState('');

  useEffect(() => {
    const confirm = async () => {
      try {
        // Il metodo più semplice per gestire l'URL hash di Supabase
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (error) throw error;
          
          setMessage('✅ Email confermata! Reindirizzamento...');
          setTimeout(() => navigate('/'), 2000);
        } else {
          throw new Error('Token mancanti nell\'URL');
        }
      } catch (err: any) {
        setError(err.message || 'Errore durante la conferma');
        setMessage('Errore durante la conferma');
      }
    };

    confirm();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full">
        <h1 className="text-xl font-bold mb-2">Conferma Email</h1>
        <p className="text-gray-700">{message}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}