
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
        console.log('AuthCallback: Avvio gestione callback');
        
        // Ottieni la sessione corrente dall'URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Errore durante il callback:', error.message);
          toast({
            title: "ERRORE AUTENTICAZIONE",
            description: "Si è verificato un errore durante la conferma dell'account",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        console.log('Sessione ottenuta:', data);

        // Se c'è una sessione valida, reindirizza alla home
        if (data?.session) {
          console.log('Sessione valida trovata, reindirizzamento alla home');
          toast({
            title: "ACCOUNT CONFERMATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto!",
          });
          navigate('/');
        } else {
          console.log('Nessuna sessione trovata, reindirizzamento al login');
          toast({
            title: "CONFERMA COMPLETATA",
            description: "Account confermato! Ora puoi effettuare il login.",
          });
          navigate('/login');
        }
      } catch (error) {
        console.error('Errore imprevisto nel callback:', error);
        toast({
          title: "ERRORE",
          description: "Si è verificato un errore imprevisto",
          variant: "destructive"
        });
        navigate('/login');
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
