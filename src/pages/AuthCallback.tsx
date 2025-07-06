
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
        console.log('🚀 AuthCallback: Inizio processo di conferma');
        console.log('📍 URL corrente:', window.location.href);
        console.log('🔍 Parametri URL:', window.location.search);
        
        // Verifica se ci sono parametri di auth nell'URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const tokenType = urlParams.get('token_type');
        const type = urlParams.get('type');
        
        console.log('🎫 Parametri trovati:', { 
          access_token: accessToken ? 'PRESENTE' : 'ASSENTE',
          refresh_token: refreshToken ? 'PRESENTE' : 'ASSENTE',
          token_type: tokenType,
          type: type
        });

        // Caso 1: Link di conferma email standard (con token nell'URL)
        if (accessToken && refreshToken) {
          console.log('✅ Trovati token nell\'URL - Caso conferma email');
          
          // Setta la sessione manualmente con i token
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('❌ Errore durante setSession:', sessionError);
            throw sessionError;
          }
          
          if (sessionData?.session?.user) {
            console.log('✅ Sessione impostata con successo:', sessionData.session.user.id);
            
            // Pulisci l'URL dai parametri di auth
            window.history.replaceState({}, document.title, window.location.pathname);
            
            toast({
              title: "ACCOUNT CONFERMATO!",
              description: "Il tuo account è stato confermato con successo. Benvenuto!",
            });
            
            navigate('/', { replace: true });
            return;
          }
        }
        
        // Caso 2: Link magic link o altri tipi di conferma
        if (type === 'signup' || type === 'email') {
          console.log('🔄 Tipo di conferma:', type);
          
          // Aspetta un momento per permettere a Supabase di processare
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Controlla se ora c'è una sessione attiva
          const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Errore durante getSession:', sessionError);
            throw sessionError;
          }
          
          if (currentSession?.session?.user) {
            console.log('✅ Sessione trovata dopo refresh:', currentSession.session.user.id);
            
            toast({
              title: "ACCOUNT CONFERMATO!",
              description: "Il tuo account è stato confermato con successo!",
            });
            
            navigate('/', { replace: true });
            return;
          }
        }
        
        // Caso 3: Nessun token o sessione trovata
        console.log('❌ Nessun token valido trovato nell\'URL');
        
        // Prova comunque a verificare se c'è una sessione attiva
        const { data: fallbackSession } = await supabase.auth.getSession();
        
        if (fallbackSession?.session?.user) {
          console.log('✅ Sessione esistente trovata come fallback');
          navigate('/', { replace: true });
          return;
        }
        
        // Se arriviamo qui, il link non è valido o è scaduto
        console.error('❌ Link di conferma non valido o scaduto');
        toast({
          title: "LINK NON VALIDO",
          description: "Il link di conferma non è valido o è scaduto. Prova a fare nuovamente la registrazione.",
          variant: "destructive"
        });
        
        navigate('/register', { replace: true });
        
      } catch (error) {
        console.error('💥 Errore imprevisto nel callback:', error);
        toast({
          title: "ERRORE",
          description: "Si è verificato un errore durante la conferma dell'account",
          variant: "destructive"
        });
        navigate('/register', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    // Aggiungi listener per debug
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 onAuthStateChange in AuthCallback:', event, session?.user?.id);
    });

    handleAuthCallback();

    return () => subscription.unsubscribe();
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
