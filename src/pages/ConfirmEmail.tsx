"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        console.log('🔍 URL completo:', window.location.href);
        console.log('🔍 Search params:', url.search);
        
        const token_hash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        
        console.log('🔍 Parametri estratti:', { 
          token_hash: token_hash ? 'PRESENTE' : 'MANCANTE', 
          type: type ? type : 'MANCANTE',
          allParams: Object.fromEntries(url.searchParams.entries())
        });

        if (!token_hash || !type) throw new Error("Token mancante o link non valido.");

        console.log('🔍 Verifica email con:', { token_hash, type });

        const { data, error } = await supabase.auth.verifyOtp({ 
          token_hash, 
          type: type as any 
        });

        if (error) {
          console.error('❌ Errore verifica:', error);
          throw error;
        }

        console.log('✅ Email confermata con successo:', data);
        
        toast({ title: "Email confermata!", description: "Ora puoi accedere." });
        navigate("/", { replace: true });
      } catch (err: any) {
        console.error("Errore nella verifica OTP:", err.message);
        setErrorMsg(err.message || "Errore imprevisto");
        setStatus("error");
      }
    })();
  }, [navigate, toast]);

  return (
    <main className="flex h-screen items-center justify-center bg-gray-950 text-white p-4">
      <div className="rounded-lg bg-gray-900 px-8 py-6 shadow-xl max-w-sm w-full text-center">
        {status === "loading" ? (
          <>
            <h1 className="text-lg font-bold mb-4">VERIFICA IN CORSO…</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
            <p className="mt-4 text-gray-400">Attendi mentre confermiamo il tuo account.</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-red-400 mb-2">ERRORE</h1>
            <p className="text-gray-300 mb-4">{errorMsg}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 w-full rounded bg-purple-600 px-4 py-2 hover:bg-purple-700"
            >
              Torna al login
            </button>
          </>
        )}
      </div>
    </main>
  );
}