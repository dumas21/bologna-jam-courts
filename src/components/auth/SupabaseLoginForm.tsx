
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useSupabaseUser } from "@/contexts/SupabaseUserContext";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import TermsAcceptance from "./TermsAcceptance";

interface SupabaseLoginFormProps {
  onSuccess: () => void;
}

const SupabaseLoginForm = ({ onSuccess }: SupabaseLoginFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, signIn, isLoading } = useSupabaseUser();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "ERRORE",
        description: "Email e password sono obbligatori",
        variant: "destructive",
      });
      return false;
    }

    if (isSignUpMode) {
      if (!nickname.trim()) {
        toast({
          title: "ERRORE",
          description: "Il nome utente è obbligatorio",
          variant: "destructive",
        });
        return false;
      }

      if (password !== confirmPassword) {
        toast({
          title: "ERRORE",
          description: "Le password non corrispondono",
          variant: "destructive",
        });
        return false;
      }

      if (password.length < 6) {
        toast({
          title: "ERRORE",
          description: "La password deve essere di almeno 6 caratteri",
          variant: "destructive",
        });
        return false;
      }

      if (!acceptedTerms) {
        toast({
          title: "ERRORE",
          description: "Devi accettare il regolamento per continuare",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;
      
      if (isSignUpMode) {
        result = await signUp(email.trim(), password, nickname.trim());
      } else {
        result = await signIn(email.trim(), password);
      }

      if (result.success) {
        onSuccess();
        
        // Play success sound
        try {
          const audio = new Audio('/sounds/coin-insert.mp3');
          audio.play();
        } catch (err) {
          console.log('Audio playback error:', err);
        }
        
        // Redirect after success
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast({
          title: isSignUpMode ? "ERRORE REGISTRAZIONE" : "ERRORE LOGIN",
          description: result.error || "Si è verificato un errore",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore di connessione",
        variant: "destructive",
      });
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setPassword("");
    setConfirmPassword("");
    setNickname("");
    setAcceptedTerms(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Button
          type="button"
          onClick={toggleMode}
          className="arcade-button arcade-button-secondary text-xs"
        >
          {isSignUpMode ? "HAI GIÀ UN ACCOUNT? ACCEDI" : "NON HAI UN ACCOUNT? REGISTRATI"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUpMode && (
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
                value={nickname}
                onChange={(e) => setNickname(e.target.value.substring(0, 20))}
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
                required={isSignUpMode}
                maxLength={20}
                autoComplete="username"
              />
            </div>
          </div>
        )}

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

        <div>
          <label className="block text-sm font-medium mb-2 arcade-label" style={{ 
            fontSize: '10px', 
            color: '#00ffff',
            textShadow: '1px 1px 0px #000'
          }}>
            PASSWORD *
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-cyan-400" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              style={{
                background: '#222',
                color: '#00ffff',
                border: 'none',
                borderRadius: '5px',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '10px',
                textAlign: 'center'
              }}
              placeholder="La tua password"
              required
              autoComplete={isSignUpMode ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-cyan-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {isSignUpMode && (
          <div>
            <label className="block text-sm font-medium mb-2 arcade-label" style={{ 
              fontSize: '10px', 
              color: '#00ffff',
              textShadow: '1px 1px 0px #000'
            }}>
              CONFERMA PASSWORD *
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-cyan-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                placeholder="Conferma password"
                required={isSignUpMode}
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {isSignUpMode && (
          <TermsAcceptance 
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={setAcceptedTerms}
          />
        )}

        <Button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim() || (isSignUpMode && (!acceptedTerms || !nickname.trim()))}
          className="w-full"
          style={{
            background: (!isLoading && email.trim() && password.trim() && (!isSignUpMode || (acceptedTerms && nickname.trim()))) ? '#ff00ff' : '#666',
            color: 'white',
            padding: '12px',
            fontSize: '12px',
            fontFamily: 'Press Start 2P, monospace',
            border: 'none',
            borderRadius: '10px',
            boxShadow: (!isLoading && email.trim() && password.trim() && (!isSignUpMode || (acceptedTerms && nickname.trim()))) ? 
              '0 0 10px #ff00ff' : '0 0 5px #666',
            cursor: (!isLoading && email.trim() && password.trim() && (!isSignUpMode || (acceptedTerms && nickname.trim()))) ? 
              'pointer' : 'not-allowed',
            marginTop: '15px',
            textShadow: '1px 1px 0px #000'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && email.trim() && password.trim() && (!isSignUpMode || (acceptedTerms && nickname.trim()))) {
              e.currentTarget.style.background = '#00ffff';
              e.currentTarget.style.color = 'black';
              e.currentTarget.style.boxShadow = '0 0 20px #00ffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && email.trim() && password.trim() && (!isSignUpMode || (acceptedTerms && nickname.trim()))) {
              e.currentTarget.style.background = '#ff00ff';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = '0 0 10px #ff00ff';
            }
          }}
        >
          {isLoading ? "CARICAMENTO..." : (isSignUpMode ? "REGISTRATI" : "ACCEDI")}
        </Button>
      </form>
    </div>
  );
};

export default SupabaseLoginForm;
