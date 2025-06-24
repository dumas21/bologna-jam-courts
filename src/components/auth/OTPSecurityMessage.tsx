
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Shield } from "lucide-react";
import { AUTH_CONFIG } from "@/config/authConfig";

interface OTPSecurityMessageProps {
  timeRemaining: number;
  isVisible: boolean;
}

const OTPSecurityMessage = ({ timeRemaining, isVisible }: OTPSecurityMessageProps) => {
  if (!isVisible) return null;

  const minutes = Math.floor(timeRemaining);
  const seconds = Math.floor((timeRemaining - minutes) * 60);

  return (
    <Alert className="mt-4 arcade-card" style={{
      border: '2px solid #00ffff',
      background: 'rgba(0, 255, 255, 0.1)'
    }}>
      <Shield className="h-4 w-4" style={{ color: '#00ffff' }} />
      <AlertDescription className="arcade-text" style={{ color: '#00ffff', fontSize: '12px' }}>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>
            OTP valido per {AUTH_CONFIG.OTP_EXPIRY_MINUTES} minuti. 
            Tempo rimanente: {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="mt-2 text-xs">
          Per sicurezza, l'OTP scade in {AUTH_CONFIG.OTP_EXPIRY_MINUTES} minuti.
          Richiedi un nuovo codice se necessario.
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default OTPSecurityMessage;
