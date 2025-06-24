
// Enhanced authentication configuration with OTP expiry settings
export const AUTH_CONFIG = {
  // OTP Configuration - 10 minutes expiry
  OTP_EXPIRY_MINUTES: 10,
  OTP_EXPIRY_SECONDS: 600,
  
  // Session configuration
  SESSION: {
    TIMEOUT_HOURS: 24,
    REFRESH_THRESHOLD_HOURS: 12,
    INACTIVITY_TIMEOUT_MINUTES: 30
  },
  
  // Security validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    REQUIRE_SPECIAL_CHARS: true,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15
  },
  
  // Rate limiting for OTP requests
  OTP_RATE_LIMIT: {
    MAX_REQUESTS_PER_HOUR: 5,
    COOLDOWN_MINUTES: 2
  }
};

// OTP validation utility
export const validateOTPTiming = (sentAt: string): { isValid: boolean; minutesRemaining: number } => {
  const sentTime = new Date(sentAt).getTime();
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - sentTime) / (1000 * 60);
  
  const isValid = elapsedMinutes <= AUTH_CONFIG.OTP_EXPIRY_MINUTES;
  const minutesRemaining = Math.max(0, AUTH_CONFIG.OTP_EXPIRY_MINUTES - elapsedMinutes);
  
  return { isValid, minutesRemaining };
};

// Session timeout checker
export const checkSessionTimeout = (): { isValid: boolean; shouldRefresh: boolean } => {
  try {
    const loginTime = localStorage.getItem("userLoginTime");
    if (!loginTime) {
      return { isValid: false, shouldRefresh: false };
    }

    const loginTimestamp = parseInt(loginTime);
    const now = Date.now();
    const sessionAgeHours = (now - loginTimestamp) / (1000 * 60 * 60);

    if (sessionAgeHours > AUTH_CONFIG.SESSION.TIMEOUT_HOURS) {
      return { isValid: false, shouldRefresh: false };
    }

    const shouldRefresh = sessionAgeHours > AUTH_CONFIG.SESSION.REFRESH_THRESHOLD_HOURS;
    return { isValid: true, shouldRefresh };
  } catch (error) {
    console.error('Session validation error:', error);
    return { isValid: false, shouldRefresh: false };
  }
};
