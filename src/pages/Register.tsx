import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
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
      setMessage("Errore: Le password non corrispondono. Inserisci due volte lo stesso codice.");
      setIsError(true);
      setLoading(false);
      return;
    }

    // Validazione: Consenso Dati
    if (!acceptedTerms) {
      setMessage("Errore: Devi accettare i termini per accedere alla Griglia.");
      setIsError(true);
      setLoading(false);
      return;
    }

    // Registrazione con username = email prefix
    const username = email.split('@')[0];
    const { error } = await signUp(email, password, username, false, '1.0');

    if (error) {
      setMessage(`ERRORE DI SISTEMA: ${error.message}`);
      setIsError(true);
    } else {
      setMessage('✅ REGISTRAZIONE COMPLETATA! Controlla la tua email per la convalida e inizia a giocare.');
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
        <h1 className="text-xl md:text-2xl text-center arcade-title mb-6">
          ACCESSO AL NETWORK
        </h1>

        {/* Messaggio di errore/successo */}
        {message && (
          <p className={`p-3 border rounded text-center ${isError ? 'text-red-400 border-red-400' : 'text-neon-yellow border-neon-yellow'}`}>
            {message}
          </p>
        )}

        {/* Campi di input */}
        <input
          className="arcade-input w-full"
          type="email"
          placeholder="EMAIL UTENTE"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="arcade-input w-full"
          type="password"
          placeholder="PASSWORD (MIN 8 CARATTERI)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="arcade-input w-full"
          type="password"
          placeholder="CONFERMA PASSWORD"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Checkbox di accettazione dati */}
        <div className="pt-2">
          <label className="newsletter-label text-xs md:text-sm">
            <input
              id="data-terms"
              type="checkbox"
              className="peer sr-only"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
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
          {loading ? 'TRASMISSIONE DATI...' : 'REGISTRATI E ACCEDI'}
        </button>

        {/* Link per login esistente */}
        <p className="text-center text-xs pt-4 arcade-text">
          HAI GIA' UN PROFILO? <a href="/login" className="arcade-link">ACCEDI QUI</a>
        </p>
      </form>
    </div>
  );
}
