
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
  const { signInWithUsername, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

      const { data, error } = await signInWithUsername(username.trim(), password);
      
      if (error) {
        console.error('Error during login:', error);
        toast({
          title: "ERRORE LOGIN",
          description: "Username o password non corretti",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "LOGIN EFFETTUATO!",
        description: "Benvenuto/a nel Playground Jam!",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                USERNAME
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
                PASSWORD
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
              {isLoading ? 'ACCESSO...' : 'ACCEDI'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Non hai ancora un account?{' '}
              <Link to="/register" className="text-purple-300 hover:text-purple-200 underline">
                Registrati qui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
