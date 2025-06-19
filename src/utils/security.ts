
import DOMPurify from 'dompurify';

// Content sanitization
export const sanitizeHTML = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

export const sanitizeText = (text: string): string => {
  // Remove any potential script tags or dangerous content
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Content length validation
export const validateContentLength = (content: string, maxLength: number = 500): boolean => {
  return content.length <= maxLength;
};

export const validateNickname = (nickname: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeText(nickname);
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Il nickname deve essere di almeno 2 caratteri' };
  }
  
  if (sanitized.length > 20) {
    return { isValid: false, error: 'Il nickname non può superare i 20 caratteri' };
  }
  
  // Check for valid characters only
  if (!/^[a-zA-Z0-9_-\s]+$/.test(sanitized)) {
    return { isValid: false, error: 'Il nickname può contenere solo lettere, numeri, spazi, trattini e underscore' };
  }
  
  return { isValid: true };
};

export const validatePlaygroundName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeText(name);
  
  if (sanitized.length < 3) {
    return { isValid: false, error: 'Il nome del playground deve essere di almeno 3 caratteri' };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, error: 'Il nome del playground non può superare i 100 caratteri' };
  }
  
  return { isValid: true };
};

// Rate limiting for chat messages
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Filter out old attempts outside the time window
    const recentAttempts = userAttempts.filter(attempt => now - attempt < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }

  getRemainingTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) || [];
    if (userAttempts.length < this.maxAttempts) return 0;
    
    const oldestAttempt = Math.min(...userAttempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, remainingTime);
  }
}

export const chatRateLimiter = new RateLimiter(10, 60000); // 10 messages per minute
export const checkInRateLimiter = new RateLimiter(5, 300000); // 5 check-ins per 5 minutes
