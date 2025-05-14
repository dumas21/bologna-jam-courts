
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [username, setUsername] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.trim().length < 3) {
      toast({
        title: "Errore",
        description: "Il nome utente deve avere almeno 3 caratteri",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would make an API call here
    login(username);
    
    toast({
      title: "Login effettuato!",
      description: `Benvenuto, ${username}!`,
    });
    
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
            <h2 className="font-press-start text-xs md:text-sm text-center py-2">
              ACCEDI AL TUO ACCOUNT
            </h2>
          </div>
          
          <div className="pixel-card p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="font-press-start text-xs text-jam-orange">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-opacity-50"
                  placeholder="Inserisci il tuo username"
                />
              </div>
              
              <Button type="submit" className="pixel-button w-full">
                ACCEDI
              </Button>
            </form>
            
            <p className="mt-6 text-center text-xs text-white/60">
              Questo è un semplice login demo.<br />
              In un'app reale ci sarebbero opzioni più complete.
            </p>
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
