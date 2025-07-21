import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthFullPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🟢 Hook auth state
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔁 Conferma email token nell'URL
  useEffect(() => {
    const confirmFromUrl = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      const access_token = hashParams.get('access_token') || queryParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const type = hashParams.get('type') || queryParams.get('type');

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          console.error('Errore setSession:', error.message);
          setError('Errore durante la conferma dell\'email');
        } else {
          setMessage('✅ Email confermata. Accesso effettuato!');
          setTimeout(() => navigate('/', { replace: true }), 1500);
        }
      }
    };

    confirmFromUrl();
  }, [navigate]);

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth-full`
      }
    });
    setLoading(false);
    if (error) setError(error.message);
    else setMessage('✅ Registrazione inviata. Controlla la tua email per confermare.');
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else setMessage('✅ Login effettuato');
  };

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth-full`
      }
    });
    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMessage('🚪 Logout effettuato');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md p-6 rounded-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Supabase Auth</h1>

        {session ? (
          <>
            <p className="mb-4">🔐 Accesso effettuato come: <strong>{session.user.email}</strong></p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded w-full"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <input
              className="w-full border p-2 mb-2 rounded"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border p-2 mb-4 rounded"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex flex-col space-y-2">
              <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={handleLogin}
                disabled={loading}
              >
                Login
              </button>
              <button
                className="bg-green-500 text-white p-2 rounded"
                onClick={handleSignup}
                disabled={loading}
              >
                Registrati
              </button>
              <button
                className="bg-gray-800 text-white p-2 rounded"
                onClick={handleGithubLogin}
              >
                Login con GitHub
              </button>
            </div>
          </>
        )}

        {message && <p className="text-green-600 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}