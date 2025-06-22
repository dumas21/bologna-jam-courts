
// Security configuration - move sensitive URLs to environment variables in production
export const SECURITY_CONFIG = {
  // In production, this should come from environment variables
  GOOGLE_SCRIPT_URL: process.env.VITE_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzY_3f5RF-cHUZ5qqdaqN89oElopEZgjP_I9h2KbYKihCD9tjh8WSr942SP8wP9SdWP/exec",
  
  // Rate limiting configuration
  RATE_LIMITS: {
    CHAT_MESSAGES_PER_PLAYGROUND: 2,
    CHAT_WINDOW_HOURS: 24,
    API_CALLS_PER_MINUTE: 10
  },
  
  // Admin emails - in production should come from backend validation
  ADMIN_EMAILS: [
    "admin@playground.com",
    "playgroundjam21@gmail.com"
  ]
};

// Secure external link handler
export const openSecureExternalLink = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
};

// Email validation with enhanced security
export const validateEmailSecurity = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato email non valido' };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = ['javascript:', 'data:', 'vbscript:', '<script'];
  if (suspiciousPatterns.some(pattern => email.toLowerCase().includes(pattern))) {
    return { isValid: false, error: 'Email contiene contenuto non sicuro' };
  }
  
  return { isValid: true };
};
