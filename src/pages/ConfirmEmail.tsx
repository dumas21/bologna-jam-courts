"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionType, setActionType] = useState<string>("");

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      try {
        // Gestisce sia URL fragment (#) che query parameters (?)
        const url = new URL(window.location.href);
        let token_hash = url.searchParams.get("token_hash");
        let type = url.searchParams.get("type");
        
        // Se non trovati nei query params, prova nell'hash fragment
        if (!token_hash || !type) {
          const hash = window.location.hash.substring(1); // Rimuove il #
          const hashParams = new URLSearchParams(hash);
          token_hash = hashParams.get("access_token") || hashParams.get("token_hash");
          type = hashParams.get("type") || "magiclink";
        }
        
        console.log('🔍 Parametri URL:', { token_hash, type, fullUrl: url.href, hash: window.location.hash });

        if (!token_hash) {
          throw new Error("Token mancante nel link. Il link potrebbe essere scaduto o non valido.");
        }
        
        // Se abbiamo un access_token nell'hash, gestiamo come sessione diretta
        if (window.location.hash.includes("access_token")) {
          console.log('🔑 Trovato access_token nell\'hash, gestisco sessione...');
          
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (data.session) {
            console.log('✅ Sessione attiva trovata:', data.session.user.email);
            toast({ 
              title: "Login effettuato! 🚀", 
              description: `Benvenuto ${data.session.user.email}!` 
            });
            setStatus("success");
            setTimeout(() => navigate("/", { replace: true }), 1500);
            return;
          }
        }

        setActionType(type || "login");

        // Gestione più robusta dei magic link
        if (type === 'magiclink' || !type) {
          console.log('🔗 Processando magic link...');
          
          // Prova prima verifyOtp
          try {
            const { data: loginData, error: loginError } = await supabase.auth.verifyOtp({
              token_hash,
              type: 'magiclink'
            });
            
            if (loginError && loginError.message?.includes('Invalid')) {
              // Se fallisce, prova con il metodo alternativo
              console.log('🔄 Tentativo metodo alternativo...');
              const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(token_hash);
              
              if (sessionError) throw sessionError;
              console.log('✅ Login completato (metodo alternativo):', sessionData);
            } else if (loginError) {
              throw loginError;
            } else {
              console.log('✅ Login con magic link completato:', loginData);
            }
            
            toast({ 
              title: "Login effettuato! 🚀", 
              description: "Benvenuto!" 
            });
            
          } catch (magicError) {
            console.error('❌ Errore magic link:', magicError);
            throw magicError;
          }
        }

        // Verifica se l'utente è ora loggato
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.warn('⚠️ Errore nel recuperare utente:', userError);
        } else if (user) {
          console.log('👤 Utente loggato:', user.email);
        }

        setStatus("success");
        
        // Redirect dopo 2 secondi
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);

      } catch (err: any) {
        console.error("❌ Errore nella verifica:", err);
        
        let userMessage = "Si è verificato un errore durante la verifica.";
        
        if (err.message?.includes('expired')) {
          userMessage = "Il link è scaduto. Richiedi un nuovo link di verifica.";
        } else if (err.message?.includes('invalid')) {
          userMessage = "Link di verifica non valido.";
        } else if (err.message?.includes('already_verified')) {
          userMessage = "Account già verificato. Prova ad accedere normalmente.";
        }
        
        setErrorMsg(userMessage);
        setStatus("error");
      }
    };

    handleAuthConfirmation();
  }, [navigate, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📧';
    }
  };

  const getStatusTitle = () => {
    if (status === 'loading') {
      switch (actionType) {
        case 'signup': return 'CONFERMANDO REGISTRAZIONE...';
        case 'magiclink': return 'EFFETTUANDO LOGIN...';
        case 'email': return 'CONFERMANDO EMAIL...';
        default: return 'VERIFICA IN CORSO...';
      }
    }
    if (status === 'success') return 'COMPLETATO!';
    return 'ERRORE';
  };

  const getStatusMessage = () => {
    if (status === 'loading') {
      switch (actionType) {
        case 'signup': return 'Stiamo attivando il tuo account...';
        case 'magiclink': return 'Ti stiamo loggando automaticamente...';
        case 'email': return 'Stiamo confermando la tua email...';
        default: return 'Attendi mentre elaboriamo la richiesta...';
      }
    }
    if (status === 'success') {
      return 'Reindirizzamento in corso...';
    }
    return errorMsg;
  };

  return (
    <main className="flex h-screen items-center justify-center bg-gray-950 text-white p-4">
      <div className="rounded-lg bg-gray-900 px-8 py-6 shadow-xl max-w-md w-full text-center">
        <div className="text-4xl mb-4">{getStatusIcon()}</div>
        
        <h1 className={`text-lg font-bold mb-4 ${
          status === 'success' ? 'text-green-400' : 
          status === 'error' ? 'text-red-400' : 
          'text-white'
        }`}>
          {getStatusTitle()}
        </h1>
        
        {status === "loading" && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4" />
        )}
        
        <p className={`mb-6 ${
          status === 'error' ? 'text-gray-300' : 'text-gray-400'
        }`}>
          {getStatusMessage()}
        </p>
        
        {status === 'success' && (
          <div className="bg-green-900/30 border border-green-700 rounded p-3 mb-4">
            <p className="text-green-300 text-sm">
              Verrai reindirizzato automaticamente...
            </p>
          </div>
        )}
        
        {status === "error" && (
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full rounded bg-purple-600 px-4 py-2 hover:bg-purple-700 transition-colors"
            >
              Torna al Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded bg-gray-700 px-4 py-2 hover:bg-gray-600 transition-colors text-sm"
            >
              Riprova
            </button>
          </div>
        )}
        
        {status === 'success' && (
          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full rounded bg-green-600 px-4 py-2 hover:bg-green-700 transition-colors"
          >
            Continua
          </button>
        )}
      </div>
    </main>
  );
}