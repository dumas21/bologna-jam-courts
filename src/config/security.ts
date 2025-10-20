
// Security configuration
export const SECURITY_CONFIG = {
  // Google Apps Script URLs are now proxied through Edge Functions
  // No longer exposed in client code for security
  
  // Rate limiting configuration - enhanced
  RATE_LIMITS: {
    CHAT_MESSAGES_PER_PLAYGROUND: 2,
    CHAT_WINDOW_HOURS: 24,
    API_CALLS_PER_MINUTE: 10,
    LOGIN_ATTEMPTS_PER_HOUR: 5,
    RATING_ATTEMPTS_PER_DAY: 3
  },
  
  // Session configuration
  SESSION: {
    TIMEOUT_HOURS: 24,
    REFRESH_THRESHOLD_HOURS: 12,
    MAX_CONCURRENT_SESSIONS: 1
  },
  
  // ADMIN_EMAILS removed for security - admin roles managed server-side via user_roles table
  
  // Content Security Policy
  CSP_SETTINGS: {
    ALLOWED_DOMAINS: [
      "'self'",
      "https://script.google.com",
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com"
    ]
  }
};

// Secure API caller with built-in rate limiting and validation
class SecureAPIClient {
  private static instance: SecureAPIClient;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {}

  static getInstance(): SecureAPIClient {
    if (!SecureAPIClient.instance) {
      SecureAPIClient.instance = new SecureAPIClient();
    }
    return SecureAPIClient.instance;
  }

  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const key = `api_${endpoint}`;
    const record = this.requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute
      return true;
    }
    
    if (record.count >= SECURITY_CONFIG.RATE_LIMITS.API_CALLS_PER_MINUTE) {
      return false;
    }
    
    record.count++;
    return true;
  }

  async securePost(endpoint: 'contact' | 'newsletter', data: any): Promise<any> {
    if (!this.checkRateLimit(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Input validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided');
    }

    // Use Edge Functions instead of direct Google Script URLs
    const { supabase } = await import('@/integrations/supabase/client');
    
    const functionName = endpoint === 'contact' ? 'contact-submit' : 'newsletter-submit';

    try {
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: data
      });

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  }
}

export const secureAPI = SecureAPIClient.getInstance();

// Secure external link handler with enhanced validation
export const openSecureExternalLink = (url: string) => {
  // Validate URL format
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch (error) {
    console.error('Invalid URL provided:', url);
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
};

// Enhanced email validation with security checks
export const validateEmailSecurity = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato email non valido' };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = ['javascript:', 'data:', 'vbscript:', '<script', 'eval(', 'onclick='];
  if (suspiciousPatterns.some(pattern => email.toLowerCase().includes(pattern))) {
    return { isValid: false, error: 'Email contiene contenuto non sicuro' };
  }
  
  // Check email length
  if (email.length > 254) {
    return { isValid: false, error: 'Email troppo lunga' };
  }
  
  return { isValid: true };
};

// Session security utilities
export const validateSession = (): { isValid: boolean; shouldRefresh: boolean } => {
  try {
    const loginTime = localStorage.getItem("userLoginTime");
    if (!loginTime) {
      return { isValid: false, shouldRefresh: false };
    }

    const loginTimestamp = parseInt(loginTime);
    const now = Date.now();
    const sessionAgeHours = (now - loginTimestamp) / (1000 * 60 * 60);

    if (sessionAgeHours > SECURITY_CONFIG.SESSION.TIMEOUT_HOURS) {
      return { isValid: false, shouldRefresh: false };
    }

    const shouldRefresh = sessionAgeHours > SECURITY_CONFIG.SESSION.REFRESH_THRESHOLD_HOURS;
    return { isValid: true, shouldRefresh };
  } catch (error) {
    console.error('Session validation error:', error);
    return { isValid: false, shouldRefresh: false };
  }
};

// Secure token generator for client-side operations
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
