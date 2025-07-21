
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

        // STRATEGIA 0: Controllo sessione PRIMA di tutto
        console.log('🔍 Controllo sessione esistente PRIMA...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Errore sessione:', sessionError);
        }

        if (session && session.user) {
          console.log('✅ UTENTE GIÀ AUTENTICATO:', session.user.email);
          setMessage('✅ Accesso già effettuato!');
          setTimeout(() => navigate('/', { replace: true }), 1000);
          return;
        }
        
        // Parsing completo dei parametri dall'hash e dalla query string
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const access_token = hashParams.get('access_token') || queryParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        const token_hash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const token = hashParams.get('token') || queryParams.get('token');
        
        console.log('📋 Parametri estratti:', {
          access_token: access_token ? 'PRESENTE' : 'MANCANTE',
          refresh_token: refresh_token ? 'PRESENTE' : 'MANCANTE',
          type,
          token_hash: token_hash ? 'PRESENTE' : 'MANCANTE',
          token: token ? 'PRESENTE' : 'MANCANTE'
        });

        // STRATEGIA 1: Se abbiamo access_token e refresh_token, usiamo setSession
        if (access_token && refresh_token) {
          console.log('🔑 Tentativo setSession con token dall\'URL...');
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (error) {
            console.error('❌ Errore setSession:', error);
            throw error;
          }
          
          console.log('✅ SetSession riuscita:', data.user?.email);
          setMessage('✅ Accesso effettuato con successo!');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        // STRATEGIA 2: Se abbiamo token_hash e type, usiamo verifyOtp
        if (token_hash && type) {
          console.log(`🔐 Tentativo verifyOtp per type: ${type}...`);
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any, // signup, magiclink, recovery, etc.
          });
          
          if (error) {
            console.error('❌ Errore verifyOtp:', error);
            throw error;
          }
          
          console.log('✅ VerifyOtp riuscita:', data.user?.email);
          setMessage('✅ Accesso effettuato con successo!');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        // STRATEGIA 3: Secondo controllo sessione (se i token non hanno funzionato)
        console.log('🔍 Secondo controllo sessione...');
        const { data: { session: existingSession }, error: existingSessionError } = await supabase.auth.getSession();
        
        if (existingSessionError) {
          console.error('❌ Errore sessione:', existingSessionError);
          throw existingSessionError;
        }

        if (existingSession && existingSession.user) {
          console.log('✅ Sessione esistente trovata:', existingSession.user.email);
          setMessage('✅ Accesso già effettuato!');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        // STRATEGIA 4: Fallback - nessun token valido trovato
        console.warn('⚠️ Nessun token valido trovato nell\'URL');
        throw new Error('Link di accesso non valido o scaduto. Riprova a fare login.');
        
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

    // Delay per permettere a Supabase di processare l'URL
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
