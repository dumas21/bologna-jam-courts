
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
        console.log('AuthCallback: Processamento conferma email avviato');
        
        // Gestisce automaticamente la sessione dall'URL usando l'API moderna
        const { data: { session }, error } = await supabase.auth.getSession();
        
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

        // Se c'è una sessione attiva, l'utente è confermato e autenticato
        if (session?.user) {
          console.log('Sessione attiva trovata, utente autenticato:', session.user.id);
          
          toast({
            title: "ACCOUNT CONFERMATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto!",
          });
          
          // Reindirizza alla home page
          navigate('/', { replace: true });
        } else {
          // Se non c'è sessione, controlla se l'URL contiene parametri di conferma
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
          const tokenType = urlParams.get('token_type') || hashParams.get('token_type');
          
          if (accessToken && refreshToken && tokenType) {
            console.log('Parametri di autenticazione trovati, impostazione sessione...');
            
            // Imposta manualmente la sessione con i token ricevuti
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Errore nell\'impostazione della sessione:', sessionError);
              toast({
                title: "ERRORE SESSIONE",
                description: "Impossibile stabilire la sessione: " + sessionError.message,
                variant: "destructive"
              });
              navigate('/login');
              return;
            }
            
            if (sessionData.session) {
              console.log('Sessione impostata con successo');
              toast({
                title: "ACCOUNT CONFERMATO!",
                description: "Il tuo account è stato confermato con successo. Benvenuto!",
              });
              navigate('/', { replace: true });
            }
          } else {
            console.log('Nessun parametro di autenticazione trovato');
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
