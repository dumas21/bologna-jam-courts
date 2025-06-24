
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignUpFormFieldsProps {
  confirmPassword: string;
  nickname: string;
  onConfirmPasswordChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
}

const SignUpFormFields = ({ 
  confirmPassword, 
  nickname, 
  onConfirmPasswordChange, 
  onNicknameChange 
}: SignUpFormFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="confirmPassword" className="arcade-text" style={{ color: '#ffcc00' }}>
          CONFERMA PASSWORD
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
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
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
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
  );
};

export default SignUpFormFields;
