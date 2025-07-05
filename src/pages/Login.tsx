
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
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { signInWithMagicLink, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Reindirizza se già autenticato
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Valida gli input
      if (!email.trim() || !username.trim()) {
        toast({
          title: "CAMPI OBBLIGATORI",
          description: "Inserisci sia email che nome utente",
          variant: "destructive"
        });
        return;
      }

      // Invia il Magic Link
      const { error } = await signInWithMagicLink(email.trim(), username.trim());
      
      if (error) {
        console.error('Error sending magic link:', error);
        toast({
          title: "ERRORE",
          description: error.message || "Si è verificato un errore durante l'invio dell'email",
          variant: "destructive"
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "EMAIL INVIATA!",
        description: `Controlla la tua casella email (${email}) e clicca sul link per accedere.`,
      });
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

  if (emailSent) {
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
          
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center">
            <h1 className="text-2xl font-bold text-white mb-6 nike-text">
              EMAIL INVIATA!
            </h1>
            <p className="text-white mb-4">
              Abbiamo inviato un link di accesso al tuo indirizzo email:
            </p>
            <p className="text-purple-300 font-bold mb-6">{email}</p>
            <p className="text-gray-300 text-sm mb-6">
              Clicca sul link nell'email per accedere. Il link è valido per 1 ora.
            </p>
            <Button 
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setUsername('');
              }}
              className="arcade-button arcade-button-secondary"
            >
              INVIA NUOVAMENTE
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
              {isLoading ? 'INVIO EMAIL...' : 'CONTINUA'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Ti invieremo un link magico per accedere senza password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
