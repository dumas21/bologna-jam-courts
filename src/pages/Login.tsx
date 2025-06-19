
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { validateNickname, sanitizeText } from "@/utils/security";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Enhanced validation
      if (!email.trim()) {
        toast({
          title: "ERRORE",
          description: "L'email è obbligatoria",
          variant: "destructive",
        });
        return;
      }

      if (!password.trim()) {
        toast({
          title: "ERRORE",
          description: "La password è obbligatoria",
          variant: "destructive",
        });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "ERRORE",
          description: "Inserisci un'email valida",
          variant: "destructive",
        });
        return;
      }

      // Password strength validation
      if (password.length < 6) {
        toast({
          title: "ERRORE",
          description: "La password deve essere di almeno 6 caratteri",
          variant: "destructive",
        });
        return;
      }

      let finalNickname = sanitizeText(email.split('@')[0]); // Default nickname from email

      if (!isLogin) {
        // Registration validation
        if (!nickname.trim()) {
          toast({
            title: "ERRORE",
            description: "Il nickname è obbligatorio per la registrazione",
            variant: "destructive",
          });
          return;
        }

        const nicknameValidation = validateNickname(nickname);
        if (!nicknameValidation.isValid) {
          toast({
            title: "ERRORE",
            description: nicknameValidation.error,
            variant: "destructive",
          });
          return;
        }

        finalNickname = sanitizeText(nickname);
      }

      if (isLogin) {
        login(finalNickname);
        toast({
          title: "LOGIN EFFETTUATO",
          description: "Benvenuto in Playground Jam Bologna!",
        });
        
        // Play success sound
        const audio = new Audio('/sounds/coin-insert.mp3');
        audio.play().catch(err => console.log('Audio playback error:', err));
        
        navigate("/");
      } else {
        // Simple registration simulation - in a real app this would call an API
        login(finalNickname);
        toast({
          title: "REGISTRAZIONE COMPLETATA",
          description: "Account creato con successo!",
        });
        
        // Play success sound
        const audio = new Audio('/sounds/coin-insert.mp3');
        audio.play().catch(err => console.log('Audio playback error:', err));
        
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="crt-overlay"></div>
      <div className="neptune-background"></div>
      
      <Header />
      
      <main className="container mx-auto p-4 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          <Button
            onClick={() => navigate("/")}
            className="mb-6 arcade-button arcade-button-secondary"
          >
            <ArrowLeft size={16} className="mr-2" />
            INDIETRO
          </Button>

          <Card className="arcade-card">
            <CardHeader>
              <CardTitle className="arcade-title text-center">
                {isLogin ? "LOGIN" : "REGISTRAZIONE"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium mb-2 arcade-label">
                      NICKNAME *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="pl-10 arcade-input"
                        placeholder="Il tuo nickname (2-20 caratteri)"
                        maxLength={20}
                        required
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Solo lettere, numeri, spazi, trattini e underscore
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2 arcade-label">
                    EMAIL *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 arcade-input"
                      placeholder="La tua email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 arcade-label">
                    PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 arcade-input"
                      placeholder="La tua password (min 6 caratteri)"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full arcade-button arcade-button-primary"
                >
                  {isLoading ? "CARICAMENTO..." : (isLogin ? "LOGIN" : "REGISTRATI")}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="arcade-link"
                >
                  {isLogin ? "Non hai un account? REGISTRATI" : "Hai già un account? LOGIN"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
