
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { error } = await signUp(email, password, username);

    if (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Errore durante la registrazione');
    } else {
      setStatus('success');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Registrati</h1>

        {status === 'success' ? (
          <div className="text-center">
            <p className="text-green-700 font-semibold mb-2">
              ✅ Registrazione avvenuta!
            </p>
            <p className="text-black">
              Controlla l'email per confermare l'account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
            />
            <input
              type="password"
              placeholder="Password (min 8 caratteri, maiuscola, minuscola, numero)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
            />
            {status === 'error' && <p className="text-red-600 font-medium">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Registrazione...' : 'Registrati'}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-center text-black">
          Hai già un account? <a href="/login" className="text-black underline font-semibold hover:text-gray-700">Accedi</a>
        </p>
      </div>
    </div>
  );
}
