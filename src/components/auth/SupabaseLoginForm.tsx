
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseUser } from "@/contexts/SupabaseUserContext";
import LoginFormFields from "./LoginFormFields";
import SignUpFormFields from "./SignUpFormFields";
import FormSubmitButton from "./FormSubmitButton";
import AuthToggleButton from "./AuthToggleButton";
import { validatePassword } from "./PasswordValidation";

interface SupabaseLoginFormProps {
  onSuccess: () => void;
}

const SupabaseLoginForm = ({ onSuccess }: SupabaseLoginFormProps) => {
  const { toast } = useToast();
  const { signIn, signUp, isLoading } = useSupabaseUser();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        const result = await signUp(formData.email, formData.password, formData.nickname);
        
        if (result.success) {
          toast({
            title: "REGISTRAZIONE COMPLETATA",
            description: "Controlla la tua email per confermare l'account.",
          });
        } else {
          if (result.error?.includes('already registered') || result.error?.includes('User already registered')) {
            toast({
              title: "UTENTE GIÀ REGISTRATO",
              description: "Questo email è già registrato. Prova ad effettuare il login.",
              variant: "destructive"
            });
            setIsSignUp(false);
          } else {
            toast({
              title: "ERRORE REGISTRAZIONE",
              description: result.error || "Errore durante la registrazione",
              variant: "destructive"
            });
          }
        }
      } else {
        const result = await signIn(formData.email, formData.password);
        
        if (result.success) {
          toast({
            title: "LOGIN COMPLETATO",
            description: "Reindirizzamento alla creazione username...",
          });
          setTimeout(() => {
            window.location.href = '/create-username';
          }, 1000);
        } else {
          if (result.error?.includes('Invalid login credentials')) {
            toast({
              title: "CREDENZIALI NON VALIDE",
              description: "Email o password non corretti",
              variant: "destructive"
            });
          } else if (result.error?.includes('Email not confirmed')) {
            toast({
              title: "EMAIL NON CONFERMATA",
              description: "Devi confermare la tua email prima di accedere. Controlla la tua casella di posta.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "ERRORE LOGIN",
              description: result.error || "Errore durante il login",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
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

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: "", password: "", nickname: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <LoginFormFields
          email={formData.email}
          password={formData.password}
          onEmailChange={(value) => handleInputChange('email', value)}
          onPasswordChange={(value) => handleInputChange('password', value)}
          isSignUp={isSignUp}
        />

        {isSignUp && (
          <SignUpFormFields
            confirmPassword={formData.confirmPassword}
            nickname={formData.nickname}
            onConfirmPasswordChange={(value) => handleInputChange('confirmPassword', value)}
            onNicknameChange={(value) => handleInputChange('nickname', value)}
          />
        )}

        <FormSubmitButton
          isLoading={isLoading}
          isSignUp={isSignUp}
          isDisabled={isLoading}
        />
      </form>

      <AuthToggleButton isSignUp={isSignUp} onToggle={handleToggle} />
    </div>
  );
};

export default SupabaseLoginForm;
