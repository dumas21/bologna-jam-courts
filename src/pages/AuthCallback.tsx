
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
        
        console.log('🎫 Token trovati:', { 
          access_token: accessToken ? 'PRESENTE' : 'ASSENTE',
          refresh_token: refreshToken ? 'PRESENTE' : 'ASSENTE',
          token_type: tokenType 
        });

        if (!accessToken) {
          console.error('❌ Nessun access_token trovato nell\'URL');
          toast({
            title: "LINK NON VALIDO",
            description: "Il link di conferma non contiene i token necessari",
            variant: "destructive"
          });
          navigate('/login', { replace: true });
          return;
        }

        // Aspetta più tempo per permettere a Supabase di processare i token
        console.log('⏳ Attendo che Supabase processi i token...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aumentato a 2 secondi
        
        // Controlla se ora c'è una sessione attiva
        console.log('🔄 Verifico la sessione...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📊 Risultato getSession:', {
          session: sessionData?.session ? 'PRESENTE' : 'ASSENTE',
          user: sessionData?.session?.user?.id || 'NESSUN UTENTE',
          error: sessionError?.message || 'NESSUN ERRORE'
        });

        if (sessionError) {
          console.error('❌ Errore durante il recupero della sessione:', sessionError);
          toast({
            title: "ERRORE AUTENTICAZIONE",
            description: "Errore durante la verifica della sessione",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        // Verifica localStorage
        const localStorageKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
        console.log('💾 Chiavi localStorage Supabase:', localStorageKeys);
        
        if (sessionData?.session?.user) {
          console.log('✅ Sessione confermata per utente:', sessionData.session.user.id);
          console.log('🎯 Email confermata:', sessionData.session.user.email_confirmed_at ? 'SÌ' : 'NO');
          
          // Pulisci l'URL dai parametri di auth
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: "ACCOUNT CONFERMATO!",
            description: "Il tuo account è stato confermato con successo. Benvenuto!",
          });
          
          // Forza un refresh della sessione nel context
          window.dispatchEvent(new Event('supabase:session-updated'));
          
          // Reindirizza alla home
          navigate('/', { replace: true });
        } else {
          console.log('❌ Nessuna sessione valida trovata dopo il callback');
          
          // Prova un approccio alternativo: verifica direttamente con refreshSession
          console.log('🔄 Tentativo refresh sessione...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          console.log('📊 Risultato refreshSession:', {
            session: refreshData?.session ? 'PRESENTE' : 'ASSENTE',
            error: refreshError?.message || 'NESSUN ERRORE'
          });
          
          if (refreshData?.session?.user) {
            console.log('✅ Sessione recuperata con refresh!');
            toast({
              title: "ACCOUNT CONFERMATO!",
              description: "Il tuo account è stato confermato con successo!",
            });
            navigate('/', { replace: true });
          } else {
            toast({
              title: "LINK NON VALIDO",
              description: "Il link di conferma non è valido o è scaduto.",
              variant: "destructive"
            });
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('💥 Errore imprevisto nel callback:', error);
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
