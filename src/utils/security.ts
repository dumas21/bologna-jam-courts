
import DOMPurify from 'dompurify';

// Enhanced content sanitization
export const sanitizeHTML = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    SANITIZE_DOM: true,
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'video', 'audio'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  });
};

export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove any potential script tags or dangerous content
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/url\s*\(/gi, '')
    .replace(/import\s*\(/gi, '')
    .trim()
    .substring(0, 1000); // Limit length
};

// Enhanced content length validation
export const validateContentLength = (content: string, maxLength: number = 500): boolean => {
  return typeof content === 'string' && content.length <= maxLength && content.length > 0;
};

// Enhanced nickname validation with additional security checks
export const validateNickname = (nickname: string): { isValid: boolean; error?: string } => {
  if (!nickname || typeof nickname !== 'string') {
    return { isValid: false, error: 'Il nickname è obbligatorio' };
  }

  const sanitized = sanitizeText(nickname);
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Il nickname deve essere di almeno 2 caratteri' };
  }
  
  if (sanitized.length > 20) {
    return { isValid: false, error: 'Il nickname non può superare i 20 caratteri' };
  }
  
  // Check for valid characters only - more restrictive
  if (!/^[a-zA-Z0-9_-\s]+$/.test(sanitized)) {
    return { isValid: false, error: 'Il nickname può contenere solo lettere, numeri, spazi, trattini e underscore' };
  }

  // Check for reserved words
  const reservedWords = ['admin', 'moderator', 'system', 'null', 'undefined', 'root', 'test'];
  if (reservedWords.some(word => sanitized.toLowerCase().includes(word))) {
    return { isValid: false, error: 'Il nickname contiene parole riservate' };
  }
  
  return { isValid: true };
};

export const validatePlaygroundName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Il nome del playground è obbligatorio' };
  }

  const sanitized = sanitizeText(name);
  
  if (sanitized.length < 3) {
    return { isValid: false, error: 'Il nome del playground deve essere di almeno 3 caratteri' };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, error: 'Il nome del playground non può superare i 100 caratteri' };
  }
  
  return { isValid: true };
};

// Enhanced rate limiting with better security
class EnhancedRateLimiter {
  private attempts: Map<string, { count: number; timestamps: number[] }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000, blockDurationMs: number = 300000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  isAllowed(identifier: string): { allowed: boolean; remainingTime?: number } {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || { count: 0, timestamps: [] };
    
    // Filter out old attempts outside the time window
    const recentTimestamps = userAttempts.timestamps.filter(timestamp => now - timestamp < this.windowMs);
    
    if (recentTimestamps.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...recentTimestamps);
      const remainingTime = this.blockDurationMs - (now - oldestAttempt);
      return { allowed: false, remainingTime: Math.max(0, remainingTime) };
    }
    
    // Add current attempt
    recentTimestamps.push(now);
    this.attempts.set(identifier, { count: recentTimestamps.length, timestamps: recentTimestamps });
    
    return { allowed: true };
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || { count: 0, timestamps: [] };
    const recentAttempts = userAttempts.timestamps.filter(timestamp => now - timestamp < this.windowMs);
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Enhanced rate limiters with better security
export const chatRateLimiter = new EnhancedRateLimiter(10, 60000, 300000); // 10 messages per minute, 5min block
export const checkInRateLimiter = new EnhancedRateLimiter(5, 300000, 600000); // 5 check-ins per 5 minutes, 10min block
export const loginRateLimiter = new EnhancedRateLimiter(5, 3600000, 1800000); // 5 attempts per hour, 30min block
export const ratingRateLimiter = new EnhancedRateLimiter(3, 86400000, 3600000); // 3 ratings per day, 1hour block

// Input validation utilities
export const validateInput = (input: any, type: 'string' | 'number' | 'email', maxLength: number = 255): { isValid: boolean; sanitized?: any; error?: string } => {
  if (input === null || input === undefined) {
    return { isValid: false, error: 'Input is required' };
  }

  switch (type) {
    case 'string':
      if (typeof input !== 'string') {
        return { isValid: false, error: 'Input must be a string' };
      }
      const sanitized = sanitizeText(input);
      if (sanitized.length === 0) {
        return { isValid: false, error: 'Input cannot be empty after sanitization' };
      }
      if (sanitized.length > maxLength) {
        return { isValid: false, error: `Input too long (max ${maxLength} characters)` };
      }
      return { isValid: true, sanitized };

    case 'number':
      const num = Number(input);
      if (isNaN(num) || !isFinite(num)) {
        return { isValid: false, error: 'Input must be a valid number' };
      }
      return { isValid: true, sanitized: num };

    case 'email':
      if (typeof input !== 'string') {
        return { isValid: false, error: 'Email must be a string' };
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(input) || input.length > 254) {
        return { isValid: false, error: 'Invalid email format' };
      }
      return { isValid: true, sanitized: input.toLowerCase().trim() };

    default:
      return { isValid: false, error: 'Unknown validation type' };
  }
};

// Secure localStorage operations
export const secureStorage = {
  setItem: (key: string, value: any): boolean => {
    try {
      const sanitizedKey = sanitizeText(key);
      if (!sanitizedKey) return false;
      
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const sanitizedValue = sanitizeText(stringValue);
      
      localStorage.setItem(sanitizedKey, sanitizedValue);
      return true;
    } catch (error) {
      console.error('Secure storage set error:', error);
      return false;
    }
  },

  getItem: (key: string): any => {
    try {
      const sanitizedKey = sanitizeText(key);
      if (!sanitizedKey) return null;
      
      const value = localStorage.getItem(sanitizedKey);
      if (!value) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return sanitizeText(value);
      }
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      const sanitizedKey = sanitizeText(key);
      if (!sanitizedKey) return false;
      
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (error) {
      console.error('Secure storage remove error:', error);
      return false;
    }
  }
};
