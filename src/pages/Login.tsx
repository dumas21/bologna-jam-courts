
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { User, ArrowLeft, Info } from "lucide-react";
import Header from "@/components/Header";
import { validateNickname, sanitizeText } from "@/utils/security";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useUser();
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Enhanced validation
      if (!nickname.trim()) {
        toast({
          title: "ERRORE",
          description: "Il nickname è obbligatorio",
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

      const finalNickname = sanitizeText(nickname);

      login(finalNickname);
      toast({
        title: "LOGIN EFFETTUATO",
        description: "Benvenuto in Playground Jam Bologna!",
      });
      
      // Play success sound
      const audio = new Audio('/sounds/coin-insert.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      navigate("/");
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
                LOGIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {/* Messaggio informativo */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-bold text-blue-800 mb-2" style={{textShadow: 'none', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px'}}>
                        RICORDA DI TENERE PULITO
                      </div>
                      <ul className="text-blue-700 space-y-1" style={{textShadow: 'none', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '9px'}}>
                        <li>• LE CHAT SI RESETTANO OGNI 72 ORE</li>
                        <li>• LE STATISTICHE RIMANGONO AGGIORNATE</li>
                        <li>• MANTIENI UN LINGUAGGIO RISPETTOSO</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full arcade-button arcade-button-primary"
                >
                  {isLoading ? "CARICAMENTO..." : "ENTRA"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
