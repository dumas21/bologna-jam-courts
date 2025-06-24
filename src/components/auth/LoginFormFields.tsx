
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormFieldsProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  isSignUp: boolean;
}

const LoginFormFields = ({ 
  email, 
  password, 
  onEmailChange, 
  onPasswordChange,
  isSignUp
}: LoginFormFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="email" className="arcade-text" style={{ color: '#ffcc00' }}>
          EMAIL
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
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
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
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
            Minimo 8 caratteri, incluso un carattere speciale
          </div>
        )}
      </div>
    </>
  );
};

export default LoginFormFields;
