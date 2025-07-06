
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [newsletter, setNewsletter] = useState(true); // Default a true dato che ora è obbligatorio
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();
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
      // Validazioni
      if (!email.trim() || !password.trim() || !username.trim()) {
        toast({
          title: "CAMPI OBBLIGATORI",
          description: "Inserisci tutti i campi obbligatori",
          variant: "destructive"
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "PASSWORD NON CORRISPONDENTI",
          description: "Le password inserite non corrispondono",
          variant: "destructive"
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "PASSWORD TROPPO CORTA",
          description: "La password deve essere di almeno 6 caratteri",
          variant: "destructive"
        });
        return;
      }

      if (username.length < 3 || username.length > 20) {
        toast({
          title: "USERNAME NON VALIDO",
          description: "L'username deve essere tra 3 e 20 caratteri",
          variant: "destructive"
        });
        return;
      }

      console.log('Avvio registrazione con:', { email: email.trim(), username: username.trim(), newsletter });

      const { data, error } = await signUp(email.trim(), password, username.trim(), newsletter, '1.0');
      
      if (error) {
        console.error('Error during registration:', error);
        toast({
          title: "ERRORE REGISTRAZIONE",
          description: error.message || "Si è verificato un errore durante la registrazione",
          variant: "destructive"
        });
        return;
      }

      console.log('Registrazione completata:', data);
      setRegistrationComplete(true);
      toast({
        title: "REGISTRAZIONE COMPLETATA!",
        description: "Controlla la tua email per confermare l'account.",
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

  if (registrationComplete) {
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
              REGISTRAZIONE COMPLETATA!
            </h1>
            <p className="text-white mb-4">
              Abbiamo inviato una email di conferma a:
            </p>
            <p className="text-purple-300 font-bold mb-6">{email}</p>
            <p className="text-gray-300 text-sm mb-6">
              Clicca sul link nell'email per attivare il tuo account. Dopo la conferma potrai accedere con il tuo username e password.
            </p>
            <p className="text-yellow-300 text-xs mb-6">
              Se il link di conferma non funziona, prova a copiare l'URL completo dalla email e incollarlo nel browser.
            </p>
            <Link to="/login">
              <Button className="arcade-button arcade-button-primary">
                VAI AL LOGIN
              </Button>
            </Link>
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
            REGISTRATI
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-white text-sm font-bold mb-2 nike-text">
                EMAIL *
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
                USERNAME *
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="scegli il tuo username (3-20 caratteri)"
                className="w-full bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                required
                disabled={isLoading}
                minLength={3}
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-white text-sm font-bold mb-2 nike-text">
                PASSWORD *
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="inserisci la password (min 6 caratteri)"
                className="w-full bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-white text-sm font-bold mb-2 nike-text">
                CONFERMA PASSWORD *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="conferma la password"
                className="w-full bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>

            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 border border-purple-400">
              <div className="flex items-start space-x-3">
                <label className="newsletter-label">
                  <input 
                    id="newsletter" 
                    name="newsletter" 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={newsletter}
                    onChange={(e) => {
                      console.log('Newsletter checkbox clicked:', e.target.checked);
                      setNewsletter(e.target.checked);
                    }}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  Newsletter PlaygroundJam
                </label>
              </div>
              <p className="text-gray-300 text-xs mt-2 ml-8">
                Iscrivendoti a PlaygroundJam accetti di ricevere la newsletter con aggiornamenti sui playground e eventi della community.
              </p>
            </div>
            
            <Button 
              type="submit"
              className="arcade-button arcade-button-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'REGISTRAZIONE...' : 'REGISTRATI'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm mb-2">
              Hai già un account?{' '}
              <Link to="/login" className="text-purple-300 hover:text-purple-200 underline">
                Accedi qui
              </Link>
            </p>
            <p className="text-gray-400 text-xs">
              Registrandoti accetti la nostra Privacy Policy e i Termini di Servizio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
