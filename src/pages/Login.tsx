import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ArrowLeft, Info, Mail, Signpost, Check } from "lucide-react";
import Header from "@/components/Header";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email.trim()) {
        toast({
          title: "ERRORE",
          description: "L'email è obbligatoria",
          variant: "destructive",
        });
        return;
      }

      if (!acceptedTerms) {
        toast({
          title: "ERRORE",
          description: "Devi accettare il regolamento per continuare",
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

      // Check if email already exists
      const existingEmails = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
      if (existingEmails.includes(email.toLowerCase())) {
        toast({
          title: "ERRORE",
          description: "Questa email è già registrata",
          variant: "destructive",
        });
        return;
      }

      // Send data to Google Sheets
      try {
        await fetch("https://script.google.com/macros/s/AKfycbyuvH-l_JVhdDSojVgTxLpe_Eexb1JtwWoOM0MQDIErNIEPWznTqmpaUBrxG9eU4e9P/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: email.split("@")[0], 
            email: email 
          })
        });

        // Store email in registered emails list
        existingEmails.push(email.toLowerCase());
        localStorage.setItem("registeredEmails", JSON.stringify(existingEmails));
      } catch (error) {
        console.log('Google Sheets error:', error);
      }

      // Store email in localStorage
      localStorage.setItem("userEmail", email);
      localStorage.setItem("chatStartTime", new Date().toISOString());
      localStorage.setItem("dailyMessageCount", "0");

      // Extract name from email for login (before @)
      const emailName = email.split("@")[0];
      login(emailName);
      
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

  const openGoogleMaps = () => {
    window.open('https://maps.google.com', '_blank');
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Maps sound error:', err));
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
            background: 'rgba(0, 0, 0, 0.9)',
            border: '3px dashed #ff00ff',
            borderRadius: '20px',
            boxShadow: '0 0 20px #00ffff',
          }}>
            <CardHeader>
              <CardTitle className="arcade-title text-center" style={{ 
                color: '#ffcc00', 
                fontSize: '18px',
                textShadow: '2px 2px 0px #000'
              }}>
                ARCADE LOGIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 arcade-label" style={{ 
                      fontSize: '10px', 
                      color: '#00ffff',
                      textShadow: '1px 1px 0px #000'
                    }}>
                      EMAIL *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-cyan-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        style={{
                          background: '#222',
                          color: '#00ffff',
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

                  {/* Checkbox per accettazione regolamento con conferma visiva */}
                  <div className="arcade-section" style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid #ff00ff',
                    borderRadius: '10px',
                    padding: '15px',
                    marginTop: '15px'
                  }}>
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="relative">
                        <Checkbox
                          id="accept-terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                          className="w-6 h-6"
                          style={{
                            borderColor: '#00ffff',
                            backgroundColor: acceptedTerms ? '#00ffff' : 'transparent',
                            borderWidth: '2px'
                          }}
                        />
                        {acceptedTerms && (
                          <Check 
                            size={16} 
                            className="absolute top-1 left-1 text-black font-bold animate-pulse" 
                          />
                        )}
                      </div>
                      <label 
                        htmlFor="accept-terms" 
                        className="text-sm cursor-pointer flex-1"
                        style={{ 
                          color: '#00ffff', 
                          fontSize: '8px',
                          fontFamily: 'Press Start 2P, monospace',
                          lineHeight: '1.4',
                          textShadow: '1px 1px 0px #000'
                        }}
                      >
                        Accetto il regolamento e le condizioni d'uso *
                      </label>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Info size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-bold mb-2" style={{ 
                          color: '#ffcc00', 
                          fontSize: '10px',
                          fontFamily: 'Press Start 2P, monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          textShadow: '1px 1px 0px #000'
                        }}>
                          REGOLE ARCADE
                        </div>
                        <div style={{ 
                          color: '#00ffff', 
                          fontSize: '8px',
                          fontFamily: 'Press Start 2P, monospace',
                          lineHeight: '1.4',
                          textShadow: '1px 1px 0px #000'
                        }}>
                          Accedendo, accetti che la tua email sia usata per la newsletter. Le chat si azzerano ogni 72h. Puoi inviare al massimo 2 messaggi ogni 24h per playground.
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !acceptedTerms}
                    className="w-full"
                    style={{
                      background: acceptedTerms ? '#ff00ff' : '#666',
                      color: 'white',
                      padding: '12px',
                      fontSize: '12px',
                      fontFamily: 'Press Start 2P, monospace',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: acceptedTerms ? '0 0 10px #ff00ff' : '0 0 5px #666',
                      cursor: acceptedTerms ? 'pointer' : 'not-allowed',
                      marginTop: '15px',
                      textShadow: '1px 1px 0px #000'
                    }}
                    onMouseEnter={(e) => {
                      if (acceptedTerms) {
                        e.currentTarget.style.background = '#00ffff';
                        e.currentTarget.style.color = 'black';
                        e.currentTarget.style.boxShadow = '0 0 20px #00ffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (acceptedTerms) {
                        e.currentTarget.style.background = '#ff00ff';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.boxShadow = '0 0 10px #ff00ff';
                      }
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
                  padding: '20px',
                  textShadow: '1px 1px 0px #000'
                }}>
                  LOGIN EFFETTUATO! REINDIRIZZAMENTO IN CORSO...
                </div>
              )}
              
              {/* Pulsante Maps con cartello stradale più grande */}
              <div className="text-center mt-4">
                <button 
                  onClick={openGoogleMaps}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-400 rounded-full border-3 border-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation"
                  title="Apri Google Maps"
                  style={{
                    boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(255,255,255,0.1)'
                  }}
                >
                  <Signpost size={32} className="drop-shadow-lg text-white" />
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
