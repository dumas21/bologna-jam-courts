
import { AUTH_CONFIG } from "@/config/authConfig";

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
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
