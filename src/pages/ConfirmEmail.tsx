
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 Avvio processo di conferma email');
        
        // 1️⃣ Tentativo con vecchio flow (#access_token)
        const { data: fragData, error: fragErr } = await supabase.auth.getSessionFromUrl({
          storeSession: true,
        });
        
        if (!fragErr && fragData.session) {
          console.log('✅ Conferma completata con vecchio flow');
          toast({ title: "EMAIL CONFERMATA!", description: "Puoi ora accedere." });
          navigate("/login", { replace: true, state: { emailVerified: true } });
          return;
        }

        // 2️⃣ Tentativo con nuovo flow (?token_hash)
        const url = new URL(window.location.href);
        const token_hash = url.searchParams.get("token_hash");
        const type = (url.searchParams.get("type") || "signup") as "signup" | "recovery";

        console.log('🔍 Controllo nuovo flow:', { token_hash: !!token_hash, type });

        if (!token_hash) {
          throw new Error("Token mancante o link non valido.");
        }

        const { error: otpErr } = await supabase.auth.verifyOtp({ token_hash, type });
        
        if (otpErr) {
          console.error('❌ Errore verifica OTP:', otpErr);
          throw otpErr;
        }

        console.log('✅ Conferma completata con nuovo flow');
        toast({ title: "EMAIL CONFERMATA!", description: "Puoi ora accedere." });
        navigate("/login", { replace: true, state: { emailVerified: true } });
        
      } catch (err: any) {
        console.error("⚠️ Errore conferma email:", err.message);
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
