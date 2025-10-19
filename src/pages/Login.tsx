
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Validazioni: conferma password e accettazione privacy
    if (password !== confirmPassword) {
      setErrorMsg('Le password non corrispondono.');
      setLoading(false);
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('Devi accettare la Policy Dati per procedere.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
        <style>{`#login-form input{color:#000!important;background:#fff!important;caret-color:#000!important;}#login-form ::placeholder{color:rgba(0,0,0,0.6)!important;}`}</style>
        <form id="login-form" onSubmit={handleLogin} className="space-y-4">
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
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
          />
          <input
            type="password"
            placeholder="Conferma Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:border-black"
          />
          <label className="text-xs flex items-start gap-2 text-black">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <span>
              Accetto la <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Policy Dati</a>
            </span>
          </label>
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
