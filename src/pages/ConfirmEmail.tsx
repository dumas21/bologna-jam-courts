import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error('❌ Errore nel setSession:', error.message);
          setStatus('error');
        } else {
          console.log('✅ Accesso automatico riuscito:', data.session?.user?.email);
          setStatus('success');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } else {
        console.warn('⚠️ Token non trovato nell\'URL');
        setStatus('error');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      {status === 'loading' && <p>🔄 Verifica in corso...</p>}
      {status === 'success' && <p className="text-green-600">✅ Email confermata! Accesso effettuato.</p>}
      {status === 'error' && (
        <>
          <p className="text-red-600">❌ Link non valido o scaduto.</p>
          <a href="/login" className="text-blue-600 underline mt-4">Torna al login</a>
        </>
      )}
    </div>
  );
}