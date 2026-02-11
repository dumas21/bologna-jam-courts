import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateEmailSecurity } from "@/config/security";

const NewsletterFooter = () => {
  const [email, setEmail] = useState("");
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEmailSecurity(email);
    if (!validation.isValid) {
      toast.error(validation.error || "Email non valida");
      return;
    }

    if (!gdprAccepted) {
      toast.error("Devi accettare la privacy policy");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("newsletter-submit", {
        body: { email },
      });

      if (error) throw error;

      toast.success("Iscrizione completata! 🏀");
      setEmail("");
      setGdprAccepted(false);
    } catch {
      toast.error("Errore durante l'iscrizione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
      <h3 className="font-press-start text-xs text-center" style={{ color: "#FF6B35", textShadow: "1px 1px 0px #000" }}>
        📬 NEWSLETTER
      </h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            type="email"
            placeholder="La tua email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 text-xs"
            required
            maxLength={254}
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !gdprAccepted}
          className="arcade-button text-xs px-4"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ISCRIVITI"}
        </Button>
      </div>

      <label className="newsletter-label text-[7px] leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={gdprAccepted}
          onChange={(e) => setGdprAccepted(e.target.checked)}
          className="peer sr-only"
        />
        <span className="checkmark" />
        <span>
          Accetto la{" "}
          <a href="/privacy-policy" className="underline" style={{ color: "#FF6B35" }}>
            Privacy Policy
          </a>{" "}
          e il trattamento dei dati per aggiornamenti sul progetto.
        </span>
      </label>
    </form>
  );
};

export default NewsletterFooter;
