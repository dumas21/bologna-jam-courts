
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Login fallito:', error.message);
      setErrorMsg('Credenziali errate o email non confermata.');
      setLoading(false);
      return;
    }

    console.log('✅ Login riuscito:', data.user?.id);
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <div className="login-card max-w-sm w-full bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
            style={{ color: '#000000', backgroundColor: '#ffffff', caretColor: '#000000' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
            style={{ color: '#000000', backgroundColor: '#ffffff', caretColor: '#000000' }}
          />
          {errorMsg && <p className="text-red-600 font-medium">{errorMsg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-black">
          Non hai un account?{' '}
          <a href="/register" className="text-black underline font-semibold hover:text-gray-700">Registrati</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
