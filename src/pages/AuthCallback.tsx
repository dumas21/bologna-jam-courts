
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
        console.log('AuthCallback: Processamento token di conferma avviato');
        
        // ① PRIMA estrai e salva i token dall'URL
        const { data, error } = await supabase.auth.getSessionFromUrl({ 
          storeSession: true 
        });
        
        if (error) {
          console.error('Errore durante l\'estrazione della sessione dall\'URL:', error);
          toast({
            title: "ERRORE AUTENTICAZIONE",
            description: "Link di conferma non valido o scaduto",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        // ② Se c'è una sessione valida dal link
        if (data?.session?.user) {
          console.log('Sessione confermata per utente:', data.session.user.id);
          
          // Pulisci l'URL dai parametri di auth
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: "ACCOUNT CONFERMATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto!",
          });
          
          // Reindirizza alla home
          navigate('/', { replace: true });
        } else {
          // ③ Fallback: controlla se c'è già una sessione attiva
          const { data: currentSession } = await supabase.auth.getSession();
          
          if (currentSession?.session?.user) {
            console.log('Sessione già attiva trovata');
            navigate('/', { replace: true });
          } else {
            console.log('Nessuna sessione valida trovata');
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
          description: "Si è verificato un errore durante la conferma dell'account",
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
