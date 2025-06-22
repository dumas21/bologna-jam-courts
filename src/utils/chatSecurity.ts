
import { sanitizeText } from './security';
import { SECURITY_CONFIG } from '../config/security';

export interface PlaygroundChatMessage {
  id: string;
  playgroundId: string;
  userId: string;
  nickname: string;
  message: string;
  timestamp: number;
}

export interface UserChatLimits {
  [playgroundId: string]: {
    messageCount: number;
    lastReset: number;
  };
}

class SecureChatManager {
  private getStorageKey(playgroundId: string): string {
    return `secure_chat_${playgroundId}`;
  }

  private getUserLimitsKey(userId: string): string {
    return `chat_limits_${userId}`;
  }

  // Get messages for a specific playground
  getPlaygroundMessages(playgroundId: string): PlaygroundChatMessage[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(playgroundId));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading playground messages:', error);
      return [];
    }
  }

  // Check if user can send message to specific playground
  canUserSendMessage(userId: string, playgroundId: string): { canSend: boolean; remainingMessages?: number; timeUntilReset?: number } {
    try {
      const limitsKey = this.getUserLimitsKey(userId);
      const stored = localStorage.getItem(limitsKey);
      const userLimits: UserChatLimits = stored ? JSON.parse(stored) : {};
      
      const now = Date.now();
      const hoursInMs = SECURITY_CONFIG.RATE_LIMITS.CHAT_WINDOW_HOURS * 60 * 60 * 1000;
      
      const playgroundLimit = userLimits[playgroundId];
      
      // If no limit exists or window has expired, reset
      if (!playgroundLimit || (now - playgroundLimit.lastReset) > hoursInMs) {
        return { 
          canSend: true, 
          remainingMessages: SECURITY_CONFIG.RATE_LIMITS.CHAT_MESSAGES_PER_PLAYGROUND - 1 
        };
      }
      
      // Check if user has reached limit
      if (playgroundLimit.messageCount >= SECURITY_CONFIG.RATE_LIMITS.CHAT_MESSAGES_PER_PLAYGROUND) {
        const timeUntilReset = hoursInMs - (now - playgroundLimit.lastReset);
        return { 
          canSend: false, 
          timeUntilReset: Math.ceil(timeUntilReset / (60 * 60 * 1000)) // hours
        };
      }
      
      return { 
        canSend: true, 
        remainingMessages: SECURITY_CONFIG.RATE_LIMITS.CHAT_MESSAGES_PER_PLAYGROUND - playgroundLimit.messageCount - 1
      };
    } catch (error) {
      console.error('Error checking user limits:', error);
      return { canSend: false };
    }
  }

  // Add message to playground chat
  addMessage(playgroundId: string, userId: string, nickname: string, message: string): boolean {
    try {
      // Check rate limits first
      const limitCheck = this.canUserSendMessage(userId, playgroundId);
      if (!limitCheck.canSend) {
        return false;
      }

      // Sanitize inputs
      const sanitizedNickname = sanitizeText(nickname);
      const sanitizedMessage = sanitizeText(message);
      
      if (!sanitizedNickname || !sanitizedMessage) {
        return false;
      }

      // Create new message
      const newMessage: PlaygroundChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playgroundId,
        userId,
        nickname: sanitizedNickname,
        message: sanitizedMessage,
        timestamp: Date.now()
      };

      // Add to playground messages
      const messages = this.getPlaygroundMessages(playgroundId);
      messages.push(newMessage);
      localStorage.setItem(this.getStorageKey(playgroundId), JSON.stringify(messages));

      // Update user limits
      this.updateUserLimits(userId, playgroundId);

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  private updateUserLimits(userId: string, playgroundId: string): void {
    try {
      const limitsKey = this.getUserLimitsKey(userId);
      const stored = localStorage.getItem(limitsKey);
      const userLimits: UserChatLimits = stored ? JSON.parse(stored) : {};
      
      const now = Date.now();
      const hoursInMs = SECURITY_CONFIG.RATE_LIMITS.CHAT_WINDOW_HOURS * 60 * 60 * 1000;
      
      const playgroundLimit = userLimits[playgroundId];
      
      if (!playgroundLimit || (now - playgroundLimit.lastReset) > hoursInMs) {
        // Reset or create new limit
        userLimits[playgroundId] = {
          messageCount: 1,
          lastReset: now
        };
      } else {
        // Increment existing limit
        userLimits[playgroundId].messageCount++;
      }
      
      localStorage.setItem(limitsKey, JSON.stringify(userLimits));
    } catch (error) {
      console.error('Error updating user limits:', error);
    }
  }

  // Clean old messages (called periodically)
  cleanOldMessages(playgroundId: string, maxAgeHours: number = 72): void {
    try {
      const messages = this.getPlaygroundMessages(playgroundId);
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      
      const filteredMessages = messages.filter(msg => msg.timestamp > cutoffTime);
      localStorage.setItem(this.getStorageKey(playgroundId), JSON.stringify(filteredMessages));
    } catch (error) {
      console.error('Error cleaning old messages:', error);
    }
  }
}

export const secureChatManager = new SecureChatManager();
