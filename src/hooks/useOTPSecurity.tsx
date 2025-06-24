
import { useState, useEffect, useCallback } from 'react';
import { AUTH_CONFIG, validateOTPTiming } from '@/config/authConfig';
import { useToast } from '@/components/ui/use-toast';

interface OTPSecurityState {
  otpSentAt: string | null;
  canRequestOTP: boolean;
  timeRemaining: number;
  isOTPValid: boolean;
  requestCount: number;
}

export const useOTPSecurity = () => {
  const { toast } = useToast();
  const [otpState, setOTPState] = useState<OTPSecurityState>({
    otpSentAt: null,
    canRequestOTP: true,
    timeRemaining: 0,
    isOTPValid: false,
    requestCount: 0
  });

  // Check OTP rate limiting
  const checkRateLimit = useCallback((): boolean => {
    const rateLimitKey = 'otp_request_count';
    const lastRequestKey = 'last_otp_request';
    const now = Date.now();
    
    const lastRequest = localStorage.getItem(lastRequestKey);
    const requestCount = parseInt(localStorage.getItem(rateLimitKey) || '0');
    
    if (lastRequest) {
      const hoursSinceLastRequest = (now - parseInt(lastRequest)) / (1000 * 60 * 60);
      
      if (hoursSinceLastRequest >= 1) {
        // Reset count after 1 hour
        localStorage.setItem(rateLimitKey, '0');
        localStorage.setItem(lastRequestKey, now.toString());
        return true;
      }
      
      if (requestCount >= AUTH_CONFIG.OTP_RATE_LIMIT.MAX_REQUESTS_PER_HOUR) {
        toast({
          title: "LIMITE RAGGIUNTO",
          description: `Troppi tentativi. Riprova tra ${AUTH_CONFIG.OTP_RATE_LIMIT.COOLDOWN_MINUTES} minuti.`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  }, [toast]);

  // Record OTP request
  const recordOTPRequest = useCallback(() => {
    const rateLimitKey = 'otp_request_count';
    const lastRequestKey = 'last_otp_request';
    const currentCount = parseInt(localStorage.getItem(rateLimitKey) || '0');
    
    localStorage.setItem(rateLimitKey, (currentCount + 1).toString());
    localStorage.setItem(lastRequestKey, Date.now().toString());
    
    setOTPState(prev => ({
      ...prev,
      otpSentAt: new Date().toISOString(),
      requestCount: currentCount + 1,
      canRequestOTP: false
    }));
  }, []);

  // Validate OTP timing
  const validateOTP = useCallback((inputOTP: string): { isValid: boolean; message?: string } => {
    if (!otpState.otpSentAt) {
      return { isValid: false, message: "Nessun OTP richiesto" };
    }

    const { isValid, minutesRemaining } = validateOTPTiming(otpState.otpSentAt);
    
    if (!isValid) {
      return { 
        isValid: false, 
        message: `OTP scaduto. Gli OTP sono validi per ${AUTH_CONFIG.OTP_EXPIRY_MINUTES} minuti.` 
      };
    }

    // Basic OTP format validation
    if (!/^\d{6}$/.test(inputOTP)) {
      return { isValid: false, message: "OTP deve essere di 6 cifre" };
    }

    return { isValid: true };
  }, [otpState.otpSentAt]);

  // Update timer every second
  useEffect(() => {
    if (otpState.otpSentAt) {
      const interval = setInterval(() => {
        const { isValid, minutesRemaining } = validateOTPTiming(otpState.otpSentAt!);
        
        setOTPState(prev => ({
          ...prev,
          timeRemaining: minutesRemaining,
          isOTPValid: isValid,
          canRequestOTP: !isValid || minutesRemaining <= 1
        }));

        if (!isValid) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [otpState.otpSentAt]);

  return {
    otpState,
    checkRateLimit,
    recordOTPRequest,
    validateOTP,
    resetOTPState: () => setOTPState({
      otpSentAt: null,
      canRequestOTP: true,
      timeRemaining: 0,
      isOTPValid: false,
      requestCount: 0
    })
  };
};
