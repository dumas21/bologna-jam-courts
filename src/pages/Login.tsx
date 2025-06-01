
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import { UserCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useUser();
  
  const [nickname, setNickname] = useState("");
  
  const playSound = (sound: string) => {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      playSound("error");
      toast({
        title: "Nickname mancante",
        description: "Inserisci un nickname per continuare",
        variant: "destructive"
      });
      return;
    }
    
    if (nickname.trim().length < 2) {
      playSound("error");
      toast({
        title: "Nickname troppo corto",
        description: "Il nickname deve avere almeno 2 caratteri",
        variant: "destructive"
      });
      return;
    }
    
    playSound("success");
    login(nickname.trim(), nickname.toLowerCase() === "matteo");
    
    toast({
      title: "Accesso effettuato",
      description: `Benvenuto, ${nickname}!`,
    });
    
    navigate("/");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1 flex flex-col items-center justify-center">
        <Logo />
        
        <div className="max-w-md w-full mt-8">
          <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
            <h2 className="font-press-start text-xs md:text-sm text-center py-2 font-bold">
              INSERISCI IL TUO NICKNAME
            </h2>
          </div>
          
          <div className="pixel-card p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="font-press-start text-xs text-jam-orange">
                  Nickname
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="bg-white text-black pl-10"
                    placeholder="Scegli il tuo nickname"
                    maxLength={20}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="pixel-button w-full"
                onClick={() => playSound("click")}
              >
                ENTRA
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-white/70">
                Il tuo nickname sarà visibile negli altri utenti nella chat dei playground
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-black bg-opacity-80 border-t-4 border-jam-purple py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/60">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
