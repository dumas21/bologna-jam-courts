// FORCE REBUILD v1.2 - Registration form with validation
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
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

    // Validate username with security utils
    const { validateNickname } = await import('@/utils/security');
    const validation = validateNickname(username);
    if (!validation.isValid) {
      setMessage(`ERRORE: ${validation.error || 'Username non valido'}`);
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
          username: username, // Use validated username
          data_consent_accepted: true
        }
      }
    });

    if (error) {
      // Map errors to generic messages
      const errorMap: Record<string, string> = {
        'User already registered': 'Questo account esiste già. Prova ad accedere.',
        'Email already registered': 'Questa email è già registrata.',
        'Invalid email': 'Email non valida.',
      };
      const userMessage = errorMap[error.message] || 'Si è verificato un errore durante la registrazione. Riprova più tardi.';
      // Error logged server-side
      setMessage(`ERRORE: ${userMessage}`);
      setIsError(true);
    } else {
      setMessage('✅ REGISTRAZIONE COMPLETA! Controlla la tua email (e lo spam) per la convalida e unisciti a noi.');
      setEmail('');
      setUsername('');
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
          type="text"
          placeholder="USERNAME (3-20 caratteri)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={20}
          pattern="^[a-zA-Z0-9_-]+$"
          title="Solo lettere, numeri, underscore e trattino"
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

        {/* Checkbox di accettazione dati GDPR */}
        <div className="pt-2">
          <div className="flex items-start gap-3">
            <input
              id="data-terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border bg-background/50 text-primary focus:ring-primary"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <label htmlFor="data-terms" className="text-xs text-muted-foreground leading-relaxed">
              Dichiaro di aver letto l'{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                informativa privacy
              </a>{' '}
              e acconsento al trattamento dei miei dati personali per la creazione dell'account, l'iscrizione alla newsletter e le comunicazioni relative al progetto, ai sensi del Regolamento UE 2016/679 (GDPR).
            </label>
          </div>
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
