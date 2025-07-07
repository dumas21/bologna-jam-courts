
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithPassword, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Utente già autenticato, redirect alla home');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Mostra messaggio se arriva da conferma email
  useEffect(() => {
    if (location.state?.emailVerified) {
      toast({
        title: "EMAIL CONFERMATA!",
        description: location.state.message || "Account attivato! Inserisci le tue credenziali per accedere.",
      });
    }
  }, [location.state, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔑 Tentativo login con email:', email);
      const { data, error } = await signInWithPassword(email, password);
      
      if (error) {
        console.error('❌ Errore login:', error);
        
        if (error.message?.includes('Email not confirmed')) {
          toast({
            title: "EMAIL NON CONFERMATA",
            description: "Controlla la tua email e clicca sul link di conferma prima di accedere.",
            variant: "destructive"
          });
        } else if (error.message?.includes('Invalid login credentials')) {
          toast({
            title: "CREDENZIALI NON VALIDE",
            description: "Email o password non corretti. Riprova.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "ERRORE LOGIN",
            description: error.message || "Errore durante il login. Riprova.",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (data?.user) {
        console.log('✅ Login completato con successo:', data.user.id);
        toast({
          title: "ACCESSO EFFETTUATO",
          description: "Benvenuto nel PlaygroundJam!",
        });
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error('💥 Errore imprevisto durante login:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore imprevisto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black bg-opacity-50 backdrop-blur-sm border border-purple-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white nike-text">
            PLAYGROUND JAM
          </CardTitle>
          <CardDescription className="text-gray-300">
            Accedi al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail size={16} />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-orange-500 text-white"
                placeholder="la-tua-email@esempio.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white flex items-center gap-2">
                <Lock size={16} />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-orange-500 text-white pr-10"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full arcade-button arcade-button-primary"
            >
              {loading ? 'ACCESSO IN CORSO...' : 'ACCEDI'}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/register')}
              className="text-purple-300 hover:text-white"
              disabled={loading}
            >
              Non hai un account? Registrati
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white flex items-center gap-2 mx-auto"
              disabled={loading}
            >
              <ArrowLeft size={16} />
              Torna alla home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
