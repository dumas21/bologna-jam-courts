import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      // Map errors to user-friendly messages
      const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Email o password non validi.',
        'Email not confirmed': 'Verifica la tua email prima di accedere.',
        'User not found': 'Email o password non validi.',
      };
      const userMessage = errorMap[error.message] || 'Si è verificato un errore durante l\'accesso. Riprova più tardi.';
      console.error('Login error:', error);
      setErrorMsg(userMessage);
      setLoading(false);
      return;
    }

    console.log('✅ Login riuscito:', data.user?.id);
    toast({ title: 'LOGIN EFFETTUATO', description: 'Benvenuto!' });
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <form onSubmit={handleLogin} className="arcade-card p-6 md:p-8 max-w-md w-full">
        <h1 className="text-xl md:text-2xl font-press-start mb-6 text-center retro-neon-text">
          ACCESSO
        </h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="arcade-input w-full p-3"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="arcade-input w-full p-3"
            disabled={loading}
          />
          
          {errorMsg && (
            <p className="text-destructive text-sm text-center p-2 border border-destructive rounded">
              {errorMsg}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="arcade-button w-full mt-4"
          >
            {loading ? 'ACCESSO IN CORSO...' : 'ACCEDI'}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Non hai un account?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            REGISTRATI
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;