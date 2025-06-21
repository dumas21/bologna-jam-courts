
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { User, ArrowLeft, Info, Mail } from "lucide-react";
import Header from "@/components/Header";
import { validateNickname, sanitizeText } from "@/utils/security";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useUser();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

      if (!email.trim()) {
        toast({
          title: "ERRORE",
          description: "L'email è obbligatoria",
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
      const finalEmail = sanitizeText(email);

      // Send data to Google Sheets
      try {
        await fetch("https://script.google.com/macros/s/AKfycbyuvH-l_JVhdDSojVgTxLpe_Eexb1JtwWoOM0MQDIErNIEPWznTqmpaUBrxG9eU4e9P/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: finalNickname, email: finalEmail })
        });
      } catch (error) {
        console.log('Google Sheets error:', error);
      }

      // Store email in localStorage for newsletter
      localStorage.setItem("userEmail", finalEmail);
      localStorage.setItem("chatStartTime", new Date().toISOString());
      localStorage.setItem("dailyMessageCount", "0");

      login(finalNickname);
      
      // Show success message
      setShowSuccess(true);
      
      // Play success sound
      const audio = new Audio('/sounds/coin-insert.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
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

          <Card className="arcade-card" style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '3px dashed #ff00ff',
            borderRadius: '20px',
            boxShadow: '0 0 20px #00ffff',
          }}>
            <CardHeader>
              <CardTitle className="arcade-title text-center" style={{ color: '#ffcc00', fontSize: '18px' }}>
                ARCADE LOGIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 arcade-label" style={{ fontSize: '10px', color: '#00ffff' }}>
                      NOME *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="pl-10"
                        style={{
                          background: '#222',
                          color: '#0ff',
                          border: 'none',
                          borderRadius: '5px',
                          fontFamily: 'Press Start 2P, monospace',
                          fontSize: '10px',
                          textAlign: 'center'
                        }}
                        placeholder="Il tuo nickname (2-20 caratteri)"
                        maxLength={20}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 arcade-label" style={{ fontSize: '10px', color: '#00ffff' }}>
                      EMAIL *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        style={{
                          background: '#222',
                          color: '#0ff',
                          border: 'none',
                          borderRadius: '5px',
                          fontFamily: 'Press Start 2P, monospace',
                          fontSize: '10px',
                          textAlign: 'center'
                        }}
                        placeholder="La tua email"
                        required
                      />
                    </div>
                  </div>

                  {/* Messaggio informativo arcade style */}
                  <div className="arcade-section" style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '2px solid #ff00ff',
                    borderRadius: '10px',
                    padding: '15px',
                    marginTop: '15px'
                  }}>
                    <div className="flex items-start space-x-3">
                      <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" style={{ color: '#00ffff' }} />
                      <div className="text-sm">
                        <div className="font-bold mb-2" style={{ 
                          color: '#ffcc00', 
                          fontSize: '10px',
                          fontFamily: 'Press Start 2P, monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          REGOLE ARCADE
                        </div>
                        <div style={{ 
                          color: '#00ffff', 
                          fontSize: '8px',
                          fontFamily: 'Press Start 2P, monospace',
                          lineHeight: '1.4'
                        }}>
                          Accedendo, accetti che il tuo nome venga mostrato nella chat e che la tua email sia usata per la newsletter. Le chat si azzerano ogni 72h. Puoi inviare al massimo 2 messaggi ogni 24h per chat.
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    style={{
                      background: '#ff00ff',
                      color: 'white',
                      padding: '12px',
                      fontSize: '12px',
                      fontFamily: 'Press Start 2P, monospace',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: '0 0 10px #ff00ff',
                      cursor: 'pointer',
                      marginTop: '15px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#00ffff';
                      e.currentTarget.style.color = 'black';
                      e.currentTarget.style.boxShadow = '0 0 20px #00ffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ff00ff';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.boxShadow = '0 0 10px #ff00ff';
                    }}
                  >
                    {isLoading ? "CARICAMENTO..." : "LOGIN"}
                  </Button>
                </form>
              ) : (
                <div className="text-center" style={{
                  fontSize: '10px',
                  color: '#00ff99',
                  fontFamily: 'Press Start 2P, monospace',
                  padding: '20px'
                }}>
                  LOGIN EFFETTUATO! REINDIRIZZAMENTO IN CORSO...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
