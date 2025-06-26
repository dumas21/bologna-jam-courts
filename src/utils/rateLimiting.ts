
import { SecureStorage } from './secureStorage';

interface RateLimitInfo {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockExpiry?: number;
}

export class ClientRateLimiter {
  private static readonly LIMITS = {
    CHECK_IN: { maxAttempts: 5, windowMs: 5 * 60 * 1000, blockMs: 10 * 60 * 1000 },
    RATING: { maxAttempts: 3, windowMs: 24 * 60 * 60 * 1000, blockMs: 60 * 60 * 1000 },
    GENERAL: { maxAttempts: 10, windowMs: 60 * 1000, blockMs: 5 * 60 * 1000 }
  };

  static checkLimit(action: keyof typeof this.LIMITS): { allowed: boolean; remainingTime?: number; remainingAttempts?: number } {
    const limit = this.LIMITS[action];
    const key = `rate_limit_${action.toLowerCase()}`;
    const now = Date.now();
    
    try {
      const stored = SecureStorage.getUserPreference(key) as RateLimitInfo | null;
      
      if (!stored) {
        // First attempt
        this.updateLimit(action, { count: 1, windowStart: now, blocked: false });
        return { allowed: true, remainingAttempts: limit.maxAttempts - 1 };
      }
      
      // Check if user is currently blocked
      if (stored.blocked && stored.blockExpiry && now < stored.blockExpiry) {
        return { 
          allowed: false, 
          remainingTime: stored.blockExpiry - now,
          remainingAttempts: 0
        };
      }
      
      // Check if window has expired
      if (now - stored.windowStart > limit.windowMs) {
        // Reset window
        this.updateLimit(action, { count: 1, windowStart: now, blocked: false });
        return { allowed: true, remainingAttempts: limit.maxAttempts - 1 };
      }
      
      // Check if limit exceeded
      if (stored.count >= limit.maxAttempts) {
        // Block user
        const blockExpiry = now + limit.blockMs;
        this.updateLimit(action, { 
          ...stored, 
          blocked: true, 
          blockExpiry 
        });
        return { 
          allowed: false, 
          remainingTime: limit.blockMs,
          remainingAttempts: 0
        };
      }
      
      // Increment and allow
      this.updateLimit(action, { 
        ...stored, 
        count: stored.count + 1 
      });
      
      return { 
        allowed: true, 
        remainingAttempts: limit.maxAttempts - stored.count - 1
      };
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Allow on error to avoid blocking legitimate users
      return { allowed: true };
    }
  }
  
  private static updateLimit(action: keyof typeof this.LIMITS, info: RateLimitInfo): void {
    const key = `rate_limit_${action.toLowerCase()}`;
    SecureStorage.setUserPreference(key, info);
  }
  
  static getRemainingAttempts(action: keyof typeof this.LIMITS): number {
    const limit = this.LIMITS[action];
    const key = `rate_limit_${action.toLowerCase()}`;
    const stored = SecureStorage.getUserPreference(key) as RateLimitInfo | null;
    
    if (!stored) return limit.maxAttempts;
    
    const now = Date.now();
    
    // If window expired, full attempts available
    if (now - stored.windowStart > limit.windowMs) {
      return limit.maxAttempts;
    }
    
    return Math.max(0, limit.maxAttempts - stored.count);
  }
}
