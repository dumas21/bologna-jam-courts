
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithUsername, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Se l'utente è già autenticato, reindirizza alla home
    if (isAuthenticated && !authLoading && user) {
      console.log('✅ Utente già autenticato, reindirizzo alla home');
      toast({
        title: "GIÀ AUTENTICATO",
        description: `Benvenuto/a ${user.email}! Sei già loggato.`,
      });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        toast({
          title: "CAMPI OBBLIGATORI",
          description: "Inserisci sia username che password",
          variant: "destructive"
        });
        return;
      }

      console.log('🔑 Tentativo di login per:', username.trim());

      const { data, error } = await signInWithUsername(username.trim(), password);
      
      if (error) {
        console.error('❌ Errore durante login:', error);
        
        let errorMessage = "Errore durante il login";
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Username o password non corretti. Assicurati che il tuo account sia stato confermato via email.";
        } else if (error.message?.includes('not found')) {
          errorMessage = "Username non trovato. Verifica di aver inserito l'username corretto.";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Account non ancora confermato. Controlla la tua email e clicca sul link di conferma.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "ERRORE LOGIN",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data?.user) {
        console.log('✅ Login effettuato per utente:', data.user.id);
        toast({
          title: "LOGIN EFFETTUATO!",
          description: "Benvenuto/a nel Playground Jam!",
        });
        
        // Il reindirizzamento verrà gestito dall'useEffect quando isAuthenticated diventa true
      }
      
    } catch (error) {
      console.error('💥 Errore imprevisto:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mostra un loader se stiamo controllando l'autenticazione
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Se l'utente è già autenticato, mostra un messaggio
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center">
            <h1 className="text-2xl font-bold text-white mb-6 nike-text">
              GIÀ AUTENTICATO
            </h1>
            <p className="text-white mb-4">
              Sei già loggato come:
            </p>
            <p className="text-purple-300 font-bold mb-6">{user.email}</p>
            <Button 
              onClick={() => navigate('/')}
              className="arcade-button arcade-button-primary w-full mb-4"
            >
              VAI ALLA HOME
            </Button>
            <Button 
              onClick={() => navigate('/logout')}
              className="arcade-button arcade-button-secondary w-full"
            >
              LOGOUT
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 text-white hover:text-purple-300 transition-colors"
        >
          <ArrowLeft size={20} />
          Torna indietro
        </button>
        
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500">
          <h1 className="text-2xl font-bold text-white mb-8 text-center nike-text">
            ACCEDI
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="block text-white text-sm font-bold mb-2 nike-text">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="inserisci il tuo username"
                className="w-full bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-white text-sm font-bold mb-2 nike-text">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="inserisci la tua password"
                className="w-full bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit"
              className="arcade-button arcade-button-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Accesso...' : 'Accedi'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm mb-2">
              Non hai ancora un account?{' '}
              <Link to="/register" className="text-purple-300 hover:text-purple-200 underline">
                Registrati qui
              </Link>
            </p>
            <p className="text-yellow-300 text-xs">
              Ricorda: devi confermare l'account via email prima di poter effettuare il login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
