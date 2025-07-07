"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Converte # in ? per gestire entrambi i formati di URL
      const url = new URL(window.location.href.replace("#", "?"));
      const token_hash = url.searchParams.get("token_hash");
      const type = (url.searchParams.get("type") || "email") as "email";

      console.log("Full URL →", window.location.href);
      console.log("Token hash →", token_hash);
      console.log("Type →", type);

      if (!token_hash) {
        setError("Token mancante o link non valido.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) {
        console.error("Errore verifica OTP:", error);
        setError(error.message);
        return;
      }

      toast({ title: "EMAIL CONFERMATA!", description: "Ora puoi accedere." });
      navigate("/login", { replace: true });
    })();
  }, [navigate, toast]);

  return (
    <main className="flex h-screen items-center justify-center bg-black text-white">
      {error ? (
        <div className="text-center">
          <h1 className="text-red-400 text-xl mb-4">ERRORE</h1>
          <p className="mb-4 text-sm text-gray-300">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            Torna al login
          </button>
        </div>
      ) : (
        <p className="text-lg">Verifica in corso…</p>
      )}
    </main>
  );
}