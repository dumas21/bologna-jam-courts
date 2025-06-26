
import { sanitizeText } from './security';

// Secure storage utility that replaces the old localStorage-based chat system
export class SecureStorage {
  private static readonly PREFIX = 'pg_secure_';
  
  // Generate a session-based identifier for anonymous users
  static getSessionId(): string {
    const key = `${this.PREFIX}session_id`;
    let sessionId = localStorage.getItem(key);
    
    if (!sessionId) {
      sessionId = this.generateSecureId();
      localStorage.setItem(key, sessionId);
    }
    
    return sessionId;
  }
  
  private static generateSecureId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}_${random}`;
  }
  
  // Secure method to store user preferences (non-sensitive data only)
  static setUserPreference(key: string, value: any): boolean {
    try {
      const sanitizedKey = sanitizeText(key);
      if (!sanitizedKey || sanitizedKey.length > 50) return false;
      
      const prefixedKey = `${this.PREFIX}pref_${sanitizedKey}`;
      const sanitizedValue = typeof value === 'string' ? sanitizeText(value) : JSON.stringify(value);
      
      if (sanitizedValue.length > 1000) return false; // Limit preference size
      
      localStorage.setItem(prefixedKey, sanitizedValue);
      return true;
    } catch (error) {
      console.error('Error storing preference:', error);
      return false;
    }
  }
  
  static getUserPreference(key: string): any {
    try {
      const sanitizedKey = sanitizeText(key);
      if (!sanitizedKey) return null;
      
      const prefixedKey = `${this.PREFIX}pref_${sanitizedKey}`;
      const value = localStorage.getItem(prefixedKey);
      
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return sanitizeText(value);
      }
    } catch (error) {
      console.error('Error retrieving preference:', error);
      return null;
    }
  }
  
  // Clean up old storage data
  static cleanup(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Remove old chat data (since we moved to database)
          if (key.startsWith('secure_chat_') || key.startsWith('chat_limits_')) {
            keysToRemove.push(key);
          }
          // Remove old temporary data
          if (key.startsWith(this.PREFIX) && key.includes('temp_')) {
            const timestamp = key.split('temp_')[1]?.split('_')[0];
            if (timestamp && Date.now() - parseInt(timestamp, 36) > 24 * 60 * 60 * 1000) {
              keysToRemove.push(key);
            }
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Initialize cleanup on load
SecureStorage.cleanup();
