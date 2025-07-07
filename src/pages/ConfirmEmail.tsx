
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 URL completa:', window.location.href);
        console.log('🔍 Parametri URL:', Object.fromEntries(searchParams.entries()));
        
        // Estrai i parametri dall'URL hash se presenti
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = urlParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        
        // Se non ci sono parametri nell'hash, prova con i query params
        const token_hash = searchParams.get('token_hash') || access_token;
        const confirmationType = searchParams.get('type') || type;
        
        console.log('🔍 Token hash:', token_hash);
        console.log('🔍 Type:', confirmationType);

        if (!token_hash || !confirmationType) {
          console.error('❌ Parametri mancanti:', { token_hash, confirmationType });
          setShowResendButton(true);
          toast({
            title: "Link non valido",
            description: "Il link di conferma non è valido. Puoi richiedere un nuovo link.",
            variant: "destructive"
          });
          return;
        }

        console.log('🔄 Verifica del token in corso...');
        
        // Usa verifyOtp per confermare l'email
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: confirmationType as any
        });

        if (error) {
          console.error('❌ Errore verifica:', error);
          
          // Se il token è scaduto, mostra il pulsante per reinviare
          if (error.message?.includes('expired') || error.message?.includes('invalid')) {
            setShowResendButton(true);
            toast({
              title: "Link scaduto",
              description: "Il link di conferma è scaduto. Puoi richiedere un nuovo link.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Errore di verifica",
              description: "Errore nella verifica dell'email. Riprova.",
              variant: "destructive"
            });
            setTimeout(() => navigate('/login'), 3000);
          }
          return;
        }

        if (data.user) {
          console.log('✅ Email confermata per utente:', data.user.id);
          
          // Recupera i dati salvati durante la registrazione
          const pendingData = localStorage.getItem('pendingUserData');
          let username = 'User';
          
          if (pendingData) {
            const userData = JSON.parse(pendingData);
            username = userData.username || 'User';
            console.log('📂 Dati recuperati per profilo:', { username, email: userData.email });
          }

          // Crea il profilo utente in Supabase
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                nickname: username,
                email: data.user.email
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
          
          // Aggiorna i dati salvati come confermati
          if (pendingData) {
            const userData = JSON.parse(pendingData);
            userData.confirmed = true;
            userData.userId = data.user.id;
            localStorage.setItem(`userCredentials_${data.user.email}`, JSON.stringify(userData));
            localStorage.removeItem('pendingUserData'); // Rimuovi i dati temporanei
          }
          
          toast({
            title: "EMAIL CONFERMATA!",
            description: "Account attivato con successo. Ora puoi accedere.",
          });
          
          // Vai al login con i dati precompilati
          navigate('/login', { 
            replace: true,
            state: { 
              emailVerified: true, 
              email: data.user.email,
              message: 'Account confermato! Inserisci le tue credenziali per accedere.' 
            }
          });
        }

      } catch (error) {
        console.error('💥 Errore imprevisto:', error);
        setShowResendButton(true);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la verifica.",
          variant: "destructive"
        });
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams, toast]);

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
          emailRedirectTo: `${window.location.origin}/auth/confirm`
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
        setShowResendButton(false);
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
        {!showResendButton ? (
          <>
            <h1 className="text-xl font-bold text-white mb-4 nike-text">
              VERIFICA EMAIL IN CORSO...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Conferma della tua registrazione...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white mb-4 nike-text">
              LINK SCADUTO
            </h1>
            <p className="text-gray-300 mb-6">
              Il link di conferma è scaduto o non valido. Puoi richiedere un nuovo link di conferma.
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
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
