import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    // Validazione: Confronto Password
    if (password !== confirmPassword) {
      setMessage("ERRORE: Le password non corrispondono. Riprova a inserire il codice.");
      setIsError(true);
      setLoading(false);
      return;
    }

    // Validazione: Consenso Dati
    if (!acceptedTerms) {
      setMessage("ERRORE: Devi accettare la Policy Dati per accedere al Network.");
      setIsError(true);
      setLoading(false);
      return;
    }

    // Registrazione Supabase con emailRedirectTo
    const redirectUrl = `${window.location.origin}/confirm-email`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: email.split('@')[0]
        }
      }
    });

    if (error) {
      setMessage(`ERRORE DI SISTEMA: ${error.message}`);
      setIsError(true);
    } else {
      setMessage('✅ REGISTRAZIONE COMPLETA! Controlla la tua email (e lo spam) per la convalida e unisciti a noi.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptedTerms(false);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <form onSubmit={handleSignup} className="arcade-card p-8 md:p-10 w-full max-w-md space-y-4 animate-neon-pulse">
        <h1 className="text-xl md:text-2xl text-center retro-neon-text nike-text mb-6">
          NUOVA CONNESSIONE
        </h1>

        {/* Messaggio di errore/successo */}
        {message && (
          <p className={`p-3 border rounded text-center text-xs md:text-sm ${isError ? 'text-red-400 border-red-400' : 'text-neon-yellow border-neon-yellow'}`}>
            {message}
          </p>
        )}

        {/* Campi di input */}
        <input
          className="arcade-input w-full p-3"
          type="email"
          placeholder="EMAIL UTENTE"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="arcade-input w-full p-3"
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="arcade-input w-full p-3"
          type="password"
          placeholder="CONFERMA PASSWORD"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Checkbox di accettazione dati */}
        <div className="pt-2">
          <input
            id="data-terms"
            type="checkbox"
            className="peer sr-only"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
          />
          <label htmlFor="data-terms" className="newsletter-label text-xs md:text-sm">
            <span className="checkmark"></span>
            Accetto la <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:underline">Policy Dati</a>
          </label>
        </div>

        {/* Pulsante submit */}
        <button
          type="submit"
          className="arcade-button w-full mt-6"
          disabled={loading}
        >
          {loading ? 'TRASMISSIONE IN CORSO...' : 'REGISTRATI E ACCEDI'}
        </button>

        {/* Link per login esistente */}
        <p className="text-center text-xs pt-4">
          HAI GIA' UN PROFILO? <a href="/login" className="hover:underline">ACCEDI QUI</a>
        </p>
      </form>
    </div>
  );
}
