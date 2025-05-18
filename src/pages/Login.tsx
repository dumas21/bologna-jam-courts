
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { usePlaygrounds } from "@/hooks/usePlaygrounds";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import { AtSign, Lock, UserCheck, UserPlus } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerUser, verifyLogin } = usePlaygrounds();
  const { login } = useUser();
  
  // State for login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // State for registration
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("login");
  
  const playSound = (sound: string) => {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      playSound("error");
      toast({
        title: "Campi mancanti",
        description: "Inserisci email e password",
        variant: "destructive"
      });
      return;
    }
    
    const user = verifyLogin(loginEmail, loginPassword);
    
    if (user) {
      playSound("success");
      login(loginEmail, user.isAdmin);
      
      toast({
        title: "Login effettuato",
        description: `Benvenuto, ${user.nickname || loginEmail.split('@')[0]}!`,
      });
      
      navigate("/");
    } else {
      playSound("error");
      toast({
        title: "Credenziali errate",
        description: "Email o password non corretti",
        variant: "destructive"
      });
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !registerConfirmPassword) {
      playSound("error");
      toast({
        title: "Campi mancanti",
        description: "Completa tutti i campi per registrarti",
        variant: "destructive"
      });
      return;
    }
    
    if (!registerEmail.includes('@')) {
      playSound("error");
      toast({
        title: "Email non valida",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive"
      });
      return;
    }
    
    if (!nickname) {
      playSound("error");
      toast({
        title: "Nickname mancante",
        description: "Inserisci un nickname per la chat",
        variant: "destructive"
      });
      return;
    }
    
    if (registerPassword.length < 6) {
      playSound("error");
      toast({
        title: "Password troppo corta",
        description: "La password deve avere almeno 6 caratteri",
        variant: "destructive"
      });
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      playSound("error");
      toast({
        title: "Password non corrispondenti",
        description: "Le password inserite non corrispondono",
        variant: "destructive"
      });
      return;
    }
    
    // Registra l'utente
    const success = registerUser(registerEmail, registerPassword, nickname);
    
    if (success) {
      playSound("success");
      
      // Auto-login after registration
      login(registerEmail, registerEmail === "bergami.matteo@gmail.com");
      
      toast({
        title: "Registrazione completata",
        description: "Grazie per esserti registrato a Playground Jam!",
      });
      
      navigate("/");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1 flex flex-col items-center justify-center">
        <Logo />
        
        <div className="max-w-md w-full mt-8">
          <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
            <h2 className="font-press-start text-xs md:text-sm text-center py-2 font-bold">
              ACCEDI O REGISTRATI
            </h2>
          </div>
          
          <div className="pixel-card p-8">
            <Tabs 
              defaultValue="login" 
              className="w-full" 
              onValueChange={(value) => {
                setActiveTab(value);
                playSound("tab");
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="font-press-start text-xs">
                  <UserCheck className="w-4 h-4 mr-2" />
                  LOGIN
                </TabsTrigger>
                <TabsTrigger value="register" className="font-press-start text-xs">
                  <UserPlus className="w-4 h-4 mr-2" />
                  REGISTRATI
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-press-start text-xs text-jam-orange">
                      Email
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-white text-black pl-10"
                        placeholder="Inserisci la tua email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-press-start text-xs text-jam-orange">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-white text-black pl-10"
                        placeholder="Inserisci la password"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="pixel-button w-full"
                    onClick={() => playSound("click")}
                  >
                    ACCEDI
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-press-start text-xs text-jam-orange">
                      Email
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="bg-white text-black pl-10"
                        placeholder="Inserisci la tua email"
                      />
                    </div>
                  </div>
                  
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
                        placeholder="Scegli un nickname per la chat"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-press-start text-xs text-jam-orange">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="bg-white text-black pl-10"
                        placeholder="Crea una password (min. 6 caratteri)"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-press-start text-xs text-jam-orange">
                      Conferma Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="bg-white text-black pl-10"
                        placeholder="Conferma la tua password"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="pixel-button w-full"
                    onClick={() => playSound("click")}
                  >
                    REGISTRATI
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
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
