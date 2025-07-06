
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Gestione callback avviata');
        console.log('URL corrente:', window.location.href);
        
        // Prima controlla se ci sono parametri di autenticazione nell'URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('Parametri hash:', Object.fromEntries(hashParams));
        console.log('Parametri URL:', Object.fromEntries(urlParams));
        
        // Gestisci la sessione dall'URL se presente
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Errore durante il recupero della sessione:', error.message);
          toast({
            title: "ERRORE AUTENTICAZIONE",
            description: "Si è verificato un errore durante la conferma dell'account: " + error.message,
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        console.log('Dati sessione recuperati:', data);

        // Se c'è una sessione valida, l'utente è autenticato
        if (data?.session) {
          console.log('Sessione valida trovata, utente autenticato');
          
          // Forza un refresh dello stato di autenticazione
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          toast({
            title: "ACCOUNT CONFERMATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto!",
          });
          
          // Reindirizza alla home page
          navigate('/', { replace: true });
        } else {
          console.log('Nessuna sessione valida trovata');
          
          // Controlla se è un link di conferma che deve ancora essere processato
          const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
          const type = hashParams.get('type') || urlParams.get('type');
          
          if (accessToken && type === 'signup') {
            console.log('Link di conferma rilevato, processamento...');
            
            // Aspetta un momento per permettere a Supabase di processare
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Riprova a ottenere la sessione
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            
            if (retryData?.session) {
              console.log('Sessione ottenuta dopo retry');
              toast({
                title: "ACCOUNT CONFERMATO!",
                description: "Il tuo account è stato confermato con successo. Benvenuto!",
              });
              navigate('/', { replace: true });
            } else {
              console.log('Conferma completata ma sessione non attiva');
              toast({
                title: "CONFERMA COMPLETATA",
                description: "Account confermato! Ora puoi effettuare il login.",
              });
              navigate('/login', { replace: true });
            }
          } else {
            console.log('Nessun parametro di autenticazione trovato, redirect al login');
            toast({
              title: "LINK NON VALIDO",
              description: "Il link di conferma non è valido o è scaduto.",
              variant: "destructive"
            });
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Errore imprevisto nel callback:', error);
        toast({
          title: "ERRORE",
          description: "Si è verificato un errore imprevisto: " + (error as Error).message,
          variant: "destructive"
        });
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center">
          <h1 className="text-xl font-bold text-white mb-4 nike-text">
            CONFERMA ACCOUNT...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 text-sm mt-4">
            Stiamo confermando il tuo account...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
