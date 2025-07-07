
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [needsResend, setNeedsResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Se l'utente è già autenticato, reindirizza alla home
    if (isAuthenticated && user) {
      console.log('✅ Utente già autenticato, redirect alla home');
      toast({
        title: "GIÀ AUTENTICATO!",
        description: "Sei già loggato! Ti reindirizziamo alla home page.",
      });
      navigate('/', { replace: true });
      return;
    }

    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 Controllo token nella URL...');
        
        // Controlla sia nei search params che nell'hash dell'URL
        const token_hash = searchParams.get('token_hash') || 
                          searchParams.get('token') ||
                          new URLSearchParams(window.location.hash.substring(1)).get('access_token');
        
        const type = searchParams.get('type') || 'signup';
        
        console.log('🔍 Token trovato:', !!token_hash);
        console.log('🔍 Type:', type);

        if (!token_hash) {
          console.log('❌ Nessun token trovato nell\'URL');
          setIsConfirming(false);
          setNeedsResend(true);
          return;
        }

        console.log('🔄 Verifica del token in corso...');
        
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any
        });

        if (error) {
          console.error('❌ Errore verifica token:', error);
          setIsConfirming(false);
          setNeedsResend(true);
          
          toast({
            title: "TOKEN SCADUTO",
            description: "Il link di conferma è scaduto. Puoi richiederne uno nuovo.",
            variant: "destructive"
          });
          return;
        }

        if (data.user) {
          console.log('✅ Email confermata con successo!');
          
          // Crea/aggiorna il profilo utente
          await createUserProfile(data.user);
          
          // Pulisci i dati temporanei
          localStorage.removeItem('pendingUserData');
          
          toast({
            title: "EMAIL CONFERMATA!",
            description: "Account attivato con successo! Ora puoi accedere.",
          });
          
          // Piccolo delay per permettere al toast di apparire
          setTimeout(() => {
            navigate('/login', { 
              replace: true,
              state: { 
                emailVerified: true, 
                email: data.user.email,
                message: 'Account confermato! Inserisci le tue credenziali per accedere.' 
              }
            });
          }, 1000);
        }

      } catch (error) {
        console.error('💥 Errore imprevisto:', error);
        setIsConfirming(false);
        setNeedsResend(true);
        
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la verifica.",
          variant: "destructive"
        });
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams, toast, isAuthenticated, user]);

  const createUserProfile = async (user: any) => {
    try {
      const pendingData = localStorage.getItem('pendingUserData');
      let username = 'User';
      
      if (pendingData) {
        const userData = JSON.parse(pendingData);
        username = userData.username || 'User';
      } else if (user.user_metadata?.username) {
        username = user.user_metadata.username;
      } else {
        username = user.email?.split('@')[0] || 'User';
      }

      console.log('📝 Creazione/aggiornamento profilo con username:', username);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: username,
          email: user.email
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('❌ Errore profilo:', profileError);
      } else {
        console.log('✅ Profilo creato/aggiornato con successo');
      }
    } catch (profileErr) {
      console.error('💥 Errore durante gestione profilo:', profileErr);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const pendingData = localStorage.getItem('pendingUserData');
      if (!pendingData) {
        toast({
          title: "Errore",
          description: "Dati di registrazione non trovati. Registrati nuovamente.",
          variant: "destructive"
        });
        navigate('/register');
        return;
      }

      const userData = JSON.parse(pendingData);
      console.log('📧 Reinvio email di conferma per:', userData.email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      });
      
      if (error) {
        console.error('❌ Errore reinvio:', error);
        toast({
          title: "Errore reinvio",
          description: "Impossibile reinviare l'email. Riprova più tardi.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email inviata!",
          description: "Ti abbiamo inviato una nuova email di conferma. Controlla la tua casella.",
        });
        setNeedsResend(false);
        setIsConfirming(true);
      }
    } catch (error) {
      console.error('💥 Errore reinvio email:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center max-w-md w-full">
        {isConfirming ? (
          <>
            <h1 className="text-xl font-bold text-white mb-4 nike-text">
              VERIFICA EMAIL IN CORSO...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Conferma della tua registrazione...</p>
          </>
        ) : needsResend ? (
          <>
            <h1 className="text-xl font-bold text-white mb-4 nike-text">
              LINK SCADUTO O NON VALIDO
            </h1>
            <p className="text-gray-300 mb-6">
              Il link di conferma non è valido o è scaduto. Puoi richiedere un nuovo link.
            </p>
            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="arcade-button arcade-button-primary w-full"
              >
                {isResending ? 'INVIO IN CORSO...' : 'INVIA NUOVO LINK'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/register')}
                className="text-purple-300 hover:text-white w-full"
              >
                Torna alla registrazione
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-green-300 hover:text-white w-full"
              >
                Vai al Login (se hai già un account)
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white mb-4 nike-text">
              ERRORE
            </h1>
            <p className="text-gray-300 mb-6">
              Si è verificato un errore durante la verifica.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="arcade-button arcade-button-primary w-full"
            >
              VAI AL LOGIN
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
