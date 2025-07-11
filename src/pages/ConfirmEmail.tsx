import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Estrai i parametri dall'URL (?token_hash=...)
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') || 'email';
        const email = searchParams.get('email');
        
        console.log('Parametri URL:', { token_hash, type, email });
        
        if (!token_hash) {
          throw new Error('Token mancante nell\'URL');
        }

        // Verifica OTP con il token_hash
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
          email: email || undefined
        });
        
        if (error) {
          console.error('Errore nella verifica OTP:', error);
          throw error;
        }
        
        console.log('Verifica completata con successo:', data);
        
        // Verifica se la sessione è stata creata
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Sessione creata con successo:', session.user.email);
          setStatus('success');
          toast({ title: "EMAIL CONFERMATA!", description: "Ora puoi accedere." });
          
          // Reindirizza alla home
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          console.log('Email verificata, sessione non automatica');
          setStatus('success');
          toast({ title: "EMAIL CONFERMATA!", description: "Effettua il login per continuare." });
          
          // Reindirizza al login
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email confermata con successo. Effettua il login per continuare.',
                verified: true,
                email: email || ''
              } 
            });
          }, 2000);
        }
        
      } catch (error: any) {
        console.error('Errore durante la conferma email:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Si è verificato un errore durante la conferma dell\'email');
        
        // Reindirizza al login dopo un errore
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              error: 'Impossibile verificare l\'email. Il link potrebbe essere scaduto.'
            } 
          });
        }, 3000);
      }
    };

    confirmEmail();
  }, [searchParams, navigate, toast]);

  return (
    <main className="flex h-screen items-center justify-center bg-black text-white">
      <div className="text-center p-6 max-w-md mx-auto bg-gray-900 rounded-lg shadow-md">
        {status === 'loading' && (
          <>
            <h2 className="text-xl font-bold mb-4">Verifica dell'email in corso...</h2>
            <p className="mb-4">Stiamo confermando la tua email. Attendi un momento.</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h2 className="text-xl font-bold mb-4 text-green-400">Email verificata con successo!</h2>
            <p>Verrai reindirizzato automaticamente...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h2 className="text-xl font-bold mb-4 text-red-400">Errore di verifica</h2>
            <p className="mb-4">{errorMessage}</p>
            <p>Verrai reindirizzato alla pagina di login...</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-purple-600 px-4 py-2 rounded mt-4"
            >
              Torna al login
            </button>
          </>
        )}
      </div>
    </main>
  );
}