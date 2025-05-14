
// Daily reset time: 23:59
export const getDailyResetTime = () => {
  const now = new Date();
  const resetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    0
  );
  
  // If it's already past reset time, set for next day
  if (now > resetTime) {
    resetTime.setDate(resetTime.getDate() + 1);
  }
  
  return resetTime;
};

// Format time until reset
export const formatTimeUntilReset = () => {
  const now = new Date();
  const resetTime = getDailyResetTime();
  
  const diffMs = resetTime.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
};
