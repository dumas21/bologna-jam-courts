import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Mail, User } from "lucide-react";
import TermsAcceptance from "./TermsAcceptance";

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveUserToStorage = (email: string, nickname: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      
      // Check if user already exists
      const existingUserIndex = existingUsers.findIndex((u: any) => u.email === email.toLowerCase());
      
      if (existingUserIndex >= 0) {
        // Update last login
        existingUsers[existingUserIndex].lastLogin = new Date().toISOString();
        existingUsers[existingUserIndex].nickname = nickname; // Update nickname if changed
      } else {
        // Add new user
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: email.toLowerCase(),
          nickname: nickname,
          registrationDate: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        existingUsers.push(newUser);
      }
      
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));
      
      // Also maintain the simple email list for backward compatibility
      const existingEmails = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
      if (!existingEmails.includes(email.toLowerCase())) {
        existingEmails.push(email.toLowerCase());
        localStorage.setItem("registeredEmails", JSON.stringify(existingEmails));
      }
      
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  };

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

      if (!username.trim()) {
        toast({
          title: "ERRORE",
          description: "Il nome utente è obbligatorio",
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

      // Send data to Google Sheets
      try {
        await fetch("https://script.google.com/macros/s/AKfycbyuvH-l_JVhdDSojVgTxLpe_Eexb1JtwWoOM0MQDIErNIEPWznTqmpaUBrxG9eU4e9P/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: username, 
            email: email 
          })
        });
      } catch (error) {
        console.log('Google Sheets error:', error);
      }

      // Save user data to localStorage
      saveUserToStorage(email, username);

      // Store email in localStorage
      localStorage.setItem("userEmail", email);
      localStorage.setItem("chatStartTime", new Date().toISOString());
      localStorage.setItem("dailyMessageCount", "0");

      // Use username for login
      login(username);
      
      // Show success message
      onSuccess();
      
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 arcade-label" style={{ 
          fontSize: '10px', 
          color: '#00ffff',
          textShadow: '1px 1px 0px #000'
        }}>
          NOME UTENTE *
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-3 text-cyan-400" />
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            placeholder="Il tuo nome utente"
            required
          />
        </div>
      </div>

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

      <TermsAcceptance 
        acceptedTerms={acceptedTerms}
        onAcceptedTermsChange={setAcceptedTerms}
      />

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
  );
};

export default LoginForm;
