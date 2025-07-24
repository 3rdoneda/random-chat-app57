/**
 * Client-side rate limiting utility
 * Prevents abuse and spam in the application
 */

interface RateLimit {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimit> = new Map();
  private blocked: Map<string, number> = new Map();

  /**
   * Check if an action is rate limited
   */
  isLimited(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    
    // Check if currently blocked
    const blockUntil = this.blocked.get(key);
    if (blockUntil && now < blockUntil) {
      return true;
    }
    
    // Remove expired blocks
    if (blockUntil && now >= blockUntil) {
      this.blocked.delete(key);
    }
    
    const limit = this.limits.get(key);
    
    // First request or expired window
    if (!limit || now >= limit.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return false;
    }
    
    // Increment counter
    limit.count++;
    
    // Check if limit exceeded
    if (limit.count > config.maxRequests) {
      // Block for specified duration
      if (config.blockDurationMs) {
        this.blocked.set(key, now + config.blockDurationMs);
      }
      return true;
    }
    
    return false;
  }
  
  /**
   * Get remaining requests for a key
   */
  getRemainingRequests(key: string, config: RateLimitConfig): number {
    const limit = this.limits.get(key);
    if (!limit) return config.maxRequests;
    
    const remaining = config.maxRequests - limit.count;
    return Math.max(0, remaining);
  }
  
  /**
   * Get time until reset
   */
  getTimeUntilReset(key: string): number {
    const limit = this.limits.get(key);
    if (!limit) return 0;
    
    return Math.max(0, limit.resetTime - Date.now());
  }
  
  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
    this.blocked.delete(key);
  }
  
  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
    this.blocked.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  // Chat related
  SEND_MESSAGE: { maxRequests: 10, windowMs: 60000 }, // 10 messages per minute
  START_CHAT: { maxRequests: 5, windowMs: 300000 }, // 5 chats per 5 minutes
  UPLOAD_IMAGE: { maxRequests: 3, windowMs: 60000 }, // 3 images per minute
  
  // User actions
  UPDATE_PROFILE: { maxRequests: 5, windowMs: 300000 }, // 5 updates per 5 minutes
  REPORT_USER: { maxRequests: 3, windowMs: 3600000 }, // 3 reports per hour
  BLOCK_USER: { maxRequests: 10, windowMs: 3600000 }, // 10 blocks per hour
  
  // Premium actions
  PURCHASE_COINS: { maxRequests: 5, windowMs: 300000 }, // 5 purchases per 5 minutes
  CLAIM_REWARD: { maxRequests: 10, windowMs: 3600000 }, // 10 claims per hour
  
  // API calls
  API_CALL: { maxRequests: 100, windowMs: 60000 }, // 100 API calls per minute
  SEARCH_USERS: { maxRequests: 20, windowMs: 60000 }, // 20 searches per minute
} as const;

/**
 * Rate limit decorator for functions
 */
export function rateLimit(key: string, config: RateLimitConfig) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const limitKey = `${key}_${this.userId || 'anonymous'}`;
      
      if (rateLimiter.isLimited(limitKey, config)) {
        const remaining = rateLimiter.getTimeUntilReset(limitKey);
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(remaining / 1000)} seconds.`);
      }
      
      return method.apply(this, args);
    };
  };
}

/**
 * Check rate limit for user action
 */
export function checkRateLimit(
  action: keyof typeof RATE_LIMITS,
  userId: string = 'anonymous'
): { allowed: boolean; message?: string; retryAfter?: number } {
  const config = RATE_LIMITS[action];
  const key = `${action}_${userId}`;
  
  if (rateLimiter.isLimited(key, config)) {
    const retryAfter = Math.ceil(rateLimiter.getTimeUntilReset(key) / 1000);
    return {
      allowed: false,
      message: `Rate limit exceeded for ${action}. Try again in ${retryAfter} seconds.`,
      retryAfter
    };
  }
  
  return { allowed: true };
}

/**
 * Rate limit hook for React components
 */
export function useRateLimit(action: keyof typeof RATE_LIMITS, userId?: string) {
  const checkLimit = () => checkRateLimit(action, userId);
  
  const remaining = rateLimiter.getRemainingRequests(
    `${action}_${userId || 'anonymous'}`,
    RATE_LIMITS[action]
  );
  
  const timeUntilReset = rateLimiter.getTimeUntilReset(
    `${action}_${userId || 'anonymous'}`
  );
  
  return {
    checkLimit,
    remaining,
    timeUntilReset: Math.ceil(timeUntilReset / 1000),
  };
}

/**
 * Security utility functions
 */
export const SecurityUtils = {
  /**
   * Validate and sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  },
  
  /**
   * Check if message contains inappropriate content
   */
  isContentAppropriate(content: string): boolean {
    const inappropriate = [
      // Add inappropriate words/phrases here
      'spam', 'scam', 'phishing'
    ];
    
    const lowercaseContent = content.toLowerCase();
    return !inappropriate.some(word => lowercaseContent.includes(word));
  },
  
  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 5MB.' };
    }
    
    return { valid: true };
  },
  
  /**
   * Generate secure random string
   */
  generateSecureId(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
};

export default rateLimiter;
