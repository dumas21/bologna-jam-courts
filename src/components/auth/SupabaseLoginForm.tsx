import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseUser } from "@/contexts/SupabaseUserContext";
import { useOTPSecurity } from "@/hooks/useOTPSecurity";
import OTPSecurityMessage from "./OTPSecurityMessage";
import { AUTH_CONFIG } from "@/config/authConfig";

interface SupabaseLoginFormProps {
  onSuccess: () => void;
}

const SupabaseLoginForm = ({ onSuccess }: SupabaseLoginFormProps) => {
  const { toast } = useToast();
  const { signIn, signUp, isLoading } = useSupabaseUser();
  const { otpState, checkRateLimit, recordOTPRequest, validateOTP, resetOTPState } = useOTPSecurity();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
    confirmPassword: ""
  });

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < AUTH_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
      return { 
        isValid: false, 
        message: `Password deve essere di almeno ${AUTH_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caratteri` 
      };
    }

    if (AUTH_CONFIG.VALIDATION.REQUIRE_SPECIAL_CHARS) {
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!hasSpecialChar) {
        return { 
          isValid: false, 
          message: "Password deve contenere almeno un carattere speciale" 
        };
      }
    }

    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkRateLimit()) {
      return;
    }

    // Password validation for signup
    if (isSignUp) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        toast({
          title: "PASSWORD NON VALIDA",
          description: passwordValidation.message,
          variant: "destructive"
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "ERRORE",
          description: "Le password non coincidono",
          variant: "destructive"
        });
        return;
      }

      if (!formData.nickname.trim()) {
        toast({
          title: "ERRORE",
          description: "Il nickname è obbligatorio",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      if (isSignUp) {
        recordOTPRequest();
        const result = await signUp(formData.email, formData.password, formData.nickname);
        
        if (result.success) {
          toast({
            title: "REGISTRAZIONE COMPLETATA",
            description: `Controlla la tua email per confermare l'account. L'OTP scade in ${AUTH_CONFIG.OTP_EXPIRY_MINUTES} minuti.`,
          });
        } else {
          resetOTPState();
          toast({
            title: "ERRORE REGISTRAZIONE",
            description: result.error || "Errore durante la registrazione",
            variant: "destructive"
          });
        }
      } else {
        const result = await signIn(formData.email, formData.password);
        
        if (result.success) {
          toast({
            title: "LOGIN COMPLETATO",
            description: "Benvenuto nel Playground Jam!",
          });
          onSuccess();
        } else {
          toast({
            title: "ERRORE LOGIN",
            description: result.error || "Credenziali non valide",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      resetOTPState();
      console.error('Auth error:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="arcade-text" style={{ color: '#ffcc00' }}>
            EMAIL
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="arcade-input"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid #00ffff',
              color: '#ffffff'
            }}
          />
        </div>

        <div>
          <Label htmlFor="password" className="arcade-text" style={{ color: '#ffcc00' }}>
            PASSWORD
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            className="arcade-input"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid #00ffff',
              color: '#ffffff'
            }}
          />
          {isSignUp && (
            <div className="text-xs mt-1" style={{ color: '#00ffff' }}>
              Minimo {AUTH_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caratteri, incluso un carattere speciale
            </div>
          )}
        </div>

        {isSignUp && (
          <>
            <div>
              <Label htmlFor="confirmPassword" className="arcade-text" style={{ color: '#ffcc00' }}>
                CONFERMA PASSWORD
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="arcade-input"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '2px solid #00ffff',
                  color: '#ffffff'
                }}
              />
            </div>

            <div>
              <Label htmlFor="nickname" className="arcade-text" style={{ color: '#ffcc00' }}>
                NICKNAME
              </Label>
              <Input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                required
                className="arcade-input"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '2px solid #00ffff',
                  color: '#ffffff'
                }}
              />
            </div>
          </>
        )}

        <Button
          type="submit"
          disabled={isLoading || (isSignUp && otpState.otpSentAt && otpState.isOTPValid)}
          className="w-full arcade-button arcade-button-primary"
        >
          {isLoading ? "CARICAMENTO..." : isSignUp ? "REGISTRATI" : "ACCEDI"}
        </Button>
      </form>

      <OTPSecurityMessage
        timeRemaining={otpState.timeRemaining}
        isVisible={isSignUp && !!otpState.otpSentAt && otpState.isOTPValid}
      />

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setIsSignUp(!isSignUp);
            resetOTPState();
            setFormData({ email: "", password: "", nickname: "", confirmPassword: "" });
          }}
          className="arcade-text"
          style={{ color: '#00ffff' }}
        >
          {isSignUp ? "Hai già un account? ACCEDI" : "Non hai un account? REGISTRATI"}
        </Button>
      </div>
    </div>
  );
};

export default SupabaseLoginForm;
