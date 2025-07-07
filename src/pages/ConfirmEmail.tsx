
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [needsResend, setNeedsResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 URL completa:', window.location.href);
        console.log('🔍 Search params:', Object.fromEntries(searchParams.entries()));
        
        // Cerca tutti i possibili parametri per il token
        const token_hash = searchParams.get('token_hash') || 
                          searchParams.get('token') ||
                          new URLSearchParams(window.location.hash.substring(1)).get('access_token');
        
        const type = searchParams.get('type') || 'signup';
        
        console.log('🔍 Token trovato:', !!token_hash);
        console.log('🔍 Type:', type);

        if (!token_hash) {
          console.error('❌ Token mancante nell\'URL');
          setIsConfirming(false);
          setNeedsResend(true);
          
          toast({
            title: "Link non valido",
            description: "Il link di conferma non contiene i parametri necessari.",
            variant: "destructive"
          });
          return;
        }

        console.log('🔄 Verifica del token in corso...');
        
        // Prova prima con verifyOtp
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any
        });

        if (error) {
          console.error('❌ Errore verifica OTP:', error);
          
          // Se il token è scaduto, mostra opzione per reinviare
          if (error.message?.includes('expired') || error.message?.includes('invalid')) {
            setIsConfirming(false);
            setNeedsResend(true);
            
            toast({
              title: "Link scaduto",
              description: "Il link di conferma è scaduto. Puoi richiederne uno nuovo.",
              variant: "destructive"
            });
            return;
          }
          
          // Altri errori
          setIsConfirming(false);
          toast({
            title: "Errore di verifica",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data.user) {
          console.log('✅ Email confermata per utente:', data.user.id);
          
          // Crea il profilo se non esiste
          await createUserProfile(data.user);
          
          // Pulisci i dati temporanei
          localStorage.removeItem('pendingUserData');
          
          toast({
            title: "EMAIL CONFERMATA!",
            description: "Account attivato con successo. Ora puoi accedere.",
          });
          
          // Redirect al login con messaggio di successo
          navigate('/login', { 
            replace: true,
            state: { 
              emailVerified: true, 
              email: data.user.email,
              message: 'Account confermato! Inserisci le tue credenziali per accedere.' 
            }
          });
        } else {
          console.error('❌ Nessun utente restituito dalla verifica');
          setIsConfirming(false);
          setNeedsResend(true);
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
  }, [navigate, searchParams, toast]);

  const createUserProfile = async (user: any) => {
    try {
      // Recupera i dati salvati durante la registrazione
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

      console.log('📝 Creazione profilo con username:', username);

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
        console.error('❌ Errore creazione profilo:', profileError);
      } else {
        console.log('✅ Profilo creato con successo');
      }
    } catch (profileErr) {
      console.error('💥 Errore durante creazione profilo:', profileErr);
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
          description: "Ti abbiamo inviato una nuova email di conferma.",
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
              onClick={() => navigate('/register')}
              className="arcade-button arcade-button-primary w-full"
            >
              TORNA ALLA REGISTRAZIONE
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
