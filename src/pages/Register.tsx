
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '@/lib/supabase-auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { data, error } = await signUp(email, password, username);

    if (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Errore durante la registrazione');
    } else {
      setStatus('success');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Registrati</h1>

        {status === 'success' ? (
          <p className="text-green-600 text-center">
            ✅ Registrazione avvenuta! Controlla l'email per confermare l'account.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
            {status === 'error' && <p className="text-red-500">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-black text-white py-2 rounded-lg"
            >
              {status === 'loading' ? 'Registrazione...' : 'Registrati'}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-center">
          Hai già un account? <a href="/login" className="text-blue-600 underline">Accedi</a>
        </p>
      </div>
    </div>
  );
}
