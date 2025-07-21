import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifica in corso...');
  const [error, setError] = useState('');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (hasProcessed) return;
      
      try {
        console.log('🔧 Gestendo callback autenticazione...');
        console.log('🔍 URL completo:', window.location.href);
        console.log('🔍 Hash:', window.location.hash);
        console.log('🔍 Search:', window.location.search);
        
        setHasProcessed(true);
        
        // Per magic links, Supabase gestisce automaticamente l'autenticazione
        // quando l'utente clicca il link. Dobbiamo solo verificare la sessione.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📊 Sessione corrente:', {
          hasSession: !!session,
          userEmail: session?.user?.email,
          error: sessionError?.message
        });

        if (sessionError) {
          console.error('❌ Errore sessione:', sessionError);
          throw sessionError;
        }

        if (session && session.user) {
          console.log('✅ Utente autenticato con successo:', session.user.email);
          setMessage('✅ Accesso effettuato con successo!');
          
          // Redirect con un delay per mostrare il messaggio
          setTimeout(() => {
            console.log('🔄 Reindirizzamento alla home...');
            navigate('/', { replace: true });
          }, 2000);
          
        } else {
          console.warn('⚠️ Nessuna sessione trovata dopo callback');
          
          // Proviamo a gestire manualmente i token dall'URL se presenti
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');
          
          if (access_token && refresh_token) {
            console.log('🔄 Tentativo setSession manuale...');
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (error) {
              console.error('❌ Errore setSession manuale:', error);
              throw error;
            }
            
            console.log('✅ SetSession manuale riuscita:', data.user?.email);
            setMessage('✅ Accesso effettuato con successo!');
            setTimeout(() => navigate('/', { replace: true }), 2000);
          } else {
            throw new Error('Link di accesso non valido o scaduto. Riprova a fare login.');
          }
        }
        
      } catch (err: any) {
        console.error('💥 Errore durante callback:', err);
        setError(err.message || 'Errore durante l\'accesso');
        setMessage('❌ Errore durante l\'accesso');
        
        // Dopo 5 secondi, reindirizza alla pagina di login
        setTimeout(() => {
          console.log('🔄 Reindirizzamento al login dopo errore...');
          navigate('/auth', { replace: true });
        }, 5000);
      }
    };

    // Aggiungiamo un delay per permettere a Supabase di processare l'URL
    const timer = setTimeout(handleAuthCallback, 500);
    
    return () => clearTimeout(timer);
  }, [navigate, hasProcessed]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Verifica Accesso</h1>
        <div className="mb-4">
          {!error ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          ) : (
            <div className="text-red-500 text-4xl mb-2">❌</div>
          )}
        </div>
        <p className="text-gray-700 mb-2">{message}</p>
        {error && (
          <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg">
            <p className="font-medium">Errore:</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 text-gray-600">
              Verrai reindirizzato al login tra pochi secondi...
            </p>
          </div>
        )}
        {!error && (
          <p className="text-xs text-gray-500 mt-2">
            Attendere prego...
          </p>
        )}
      </div>
    </div>
  );
}