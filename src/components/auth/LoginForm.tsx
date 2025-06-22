
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Mail, User } from "lucide-react";
import TermsAcceptance from "./TermsAcceptance";
import { validateEmailSecurity } from "@/config/security";
import { validateInput, secureStorage } from "@/utils/security";
import { secureAPI } from "@/config/security";

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
      const existingUsers = secureStorage.getItem("registeredUsers") || [];
      
      // Check if user already exists
      const existingUserIndex = existingUsers.findIndex((u: any) => u.email === email.toLowerCase());
      
      if (existingUserIndex >= 0) {
        // Update last login
        existingUsers[existingUserIndex].lastLogin = new Date().toISOString();
        existingUsers[existingUserIndex].nickname = nickname;
      } else {
        // Add new user with enhanced security
        const newUser = {
          id: `user_${Date.now()}_${crypto.getRandomValues(new Uint8Array(4)).join('')}`,
          email: email.toLowerCase(),
          nickname: nickname,
          registrationDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1
        };
        existingUsers.push(newUser);
      }
      
      secureStorage.setItem("registeredUsers", existingUsers);
      
      // Also maintain the simple email list for backward compatibility
      const existingEmails = secureStorage.getItem("registeredEmails") || [];
      if (!existingEmails.includes(email.toLowerCase())) {
        existingEmails.push(email.toLowerCase());
        secureStorage.setItem("registeredEmails", existingEmails);
      }
      
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Enhanced input validation
      const emailValidation = validateInput(email.trim(), 'email');
      if (!emailValidation.isValid) {
        toast({
          title: "ERRORE EMAIL",
          description: emailValidation.error,
          variant: "destructive",
        });
        return;
      }

      const usernameValidation = validateInput(username.trim(), 'string', 20);
      if (!usernameValidation.isValid) {
        toast({
          title: "ERRORE USERNAME",
          description: usernameValidation.error,
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

      // Additional email security validation
      const emailSecurityCheck = validateEmailSecurity(emailValidation.sanitized);
      if (!emailSecurityCheck.isValid) {
        toast({
          title: "ERRORE SICUREZZA",
          description: emailSecurityCheck.error,
          variant: "destructive",
        });
        return;
      }

      // Send data to Google Sheets with enhanced security
      try {
        await secureAPI.securePost('registration', {
          name: usernameValidation.sanitized,
          email: emailValidation.sanitized,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          source: 'playground_app'
        });
      } catch (error) {
        console.warn('Google Sheets API error (non-critical):', error);
        // Continue with login even if external API fails
      }

      // Save user data to localStorage
      saveUserToStorage(emailValidation.sanitized, usernameValidation.sanitized);

      // Store additional secure data
      secureStorage.setItem("userEmail", emailValidation.sanitized);
      secureStorage.setItem("chatStartTime", new Date().toISOString());
      secureStorage.setItem("dailyMessageCount", 0);

      // Attempt secure login
      const loginResult = login(usernameValidation.sanitized);
      
      if (!loginResult.success) {
        toast({
          title: "ERRORE LOGIN",
          description: loginResult.error || "Login fallito",
          variant: "destructive",
        });
        return;
      }
      
      // Show success message
      onSuccess();
      
      // Play success sound
      try {
        const audio = new Audio('/sounds/coin-insert.mp3');
        audio.play();
      } catch (err) {
        console.log('Audio playback error:', err);
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore di sicurezza. Riprova.",
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
            onChange={(e) => setUsername(e.target.value.substring(0, 20))}
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
            maxLength={20}
            autoComplete="username"
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
            onChange={(e) => setEmail(e.target.value.substring(0, 254))}
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
            maxLength={254}
            autoComplete="email"
          />
        </div>
      </div>

      <TermsAcceptance 
        acceptedTerms={acceptedTerms}
        onAcceptedTermsChange={setAcceptedTerms}
      />

      <Button
        type="submit"
        disabled={isLoading || !acceptedTerms || !email.trim() || !username.trim()}
        className="w-full"
        style={{
          background: (acceptedTerms && email.trim() && username.trim()) ? '#ff00ff' : '#666',
          color: 'white',
          padding: '12px',
          fontSize: '12px',
          fontFamily: 'Press Start 2P, monospace',
          border: 'none',
          borderRadius: '10px',
          boxShadow: (acceptedTerms && email.trim() && username.trim()) ? 
            '0 0 10px #ff00ff' : '0 0 5px #666',
          cursor: (acceptedTerms && email.trim() && username.trim()) ? 
            'pointer' : 'not-allowed',
          marginTop: '15px',
          textShadow: '1px 1px 0px #000'
        }}
        onMouseEnter={(e) => {
          if (acceptedTerms && email.trim() && username.trim()) {
            e.currentTarget.style.background = '#00ffff';
            e.currentTarget.style.color = 'black';
            e.currentTarget.style.boxShadow = '0 0 20px #00ffff';
          }
        }}
        onMouseLeave={(e) => {
          if (acceptedTerms && email.trim() && username.trim()) {
            e.currentTarget.style.background = '#ff00ff';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.boxShadow = '0 0 10px #ff00ff';
          }
        }}
      >
        {isLoading ? "CARICAMENTO..." : "LOGIN SICURO"}
      </Button>
    </form>
  );
};

export default LoginForm;
