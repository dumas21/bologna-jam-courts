import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [message, setMessage] = useState('Conferma in corso...');
  const [error, setError] = useState('');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const confirm = async () => {
      if (hasProcessed) return;
      
      try {
        console.log('🔧 Iniziando conferma email...');
        
        // Gestisce sia hash che query parameters per robustezza
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const access_token = hashParams.get('access_token') || queryParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');

        console.log('🔍 Token trovati:', { 
          hasAccessToken: !!access_token, 
          hasRefreshToken: !!refresh_token,
          type 
        });

        if (access_token && refresh_token) {
          setHasProcessed(true);
          
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (error) {
            console.error('❌ Errore setSession:', error);
            throw error;
          }
          
          console.log('✅ Sessione impostata con successo:', data.user?.email);
          setMessage('✅ Email confermata! Accesso completato...');
          
          // Aspetta che l'hook useAuth rilevi il cambiamento
          setTimeout(() => {
            console.log('🔄 Reindirizzamento alla home...');
            navigate('/', { replace: true });
          }, 1500);
          
        } else {
          console.warn('⚠️ Token mancanti nell\'URL');
          throw new Error('Link di conferma non valido o scaduto');
        }
      } catch (err: any) {
        console.error('💥 Errore durante conferma:', err);
        setError(err.message || 'Errore durante la conferma');
        setMessage('❌ Errore durante la conferma');
        setHasProcessed(true);
      }
    };

    if (!hasProcessed && !isLoading) {
      confirm();
    }
  }, [navigate, hasProcessed, isLoading]);

  // Auto-redirect se l'utente è già autenticato
  useEffect(() => {
    if (isAuthenticated && hasProcessed) {
      console.log('✅ Utente già autenticato, reindirizzamento...');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, hasProcessed, navigate]);

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