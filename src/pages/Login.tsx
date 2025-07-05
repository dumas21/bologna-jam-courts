
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email.trim() || !username.trim()) {
        toast({
          title: "CAMPI OBBLIGATORI",
          description: "Inserisci sia email che nome utente",
          variant: "destructive"
        });
        return;
      }

      // Simulate login process
      login(email.trim(), username.trim());
      
      toast({
        title: "ACCESSO EFFETTUATO",
        description: `Benvenuto ${username}!`,
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore durante l'accesso",
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
            ACCEDI O REGISTRATI
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-white text-sm font-bold mb-2 nike-text">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="inserisci la tua email"
                className="w-full bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="username" className="block text-white text-sm font-bold mb-2 nike-text">
                NOME UTENTE
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="scegli il tuo nome utente"
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
              {isLoading ? 'ACCESSO IN CORSO...' : 'CONTINUA'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
