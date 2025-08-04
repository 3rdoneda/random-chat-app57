/**
 * Security utilities for AjnabiCam
 * Provides input validation, sanitization, and security checks
 */

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate username
export function isValidUsername(username: string): boolean {
  if (!username || username.length < 2 || username.length > 20) {
    return false;
  }
  
  // Allow letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
}

// Check for inappropriate content
export function containsInappropriateContent(content: string): boolean {
  const inappropriateWords = [
    // Add inappropriate words here (keeping it minimal for example)
    'spam', 'scam', 'phishing', 'hack', 'virus'
  ];
  
  const lowercaseContent = content.toLowerCase();
  return inappropriateWords.some(word => lowercaseContent.includes(word));
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File too large. Maximum size is 5MB.' 
    };
  }
  
  return { valid: true };
}

// Generate secure random string
export function generateSecureId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(array[i] % chars.length);
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

// Check if URL is safe
export function isSafeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS and HTTP
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Block known malicious domains (add more as needed)
    const blockedDomains = [
      'malicious-site.com',
      'phishing-site.com'
    ];
    
    return !blockedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (error) {
    return false;
  }
}

// Rate limiting helper
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const windowKey = `rate_limit_${key}`;
  const requests = JSON.parse(localStorage.getItem(windowKey) || '[]');
  
  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return true;
  }
  
  // Add current request
  validRequests.push(now);
  localStorage.setItem(windowKey, JSON.stringify(validRequests));
  
  return false;
}

// Content Security Policy helper
export function setupCSP(): void {
  if (import.meta.env.VITE_ENABLE_CSP === 'true') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'"
    ].join('; ');
    
    document.head.appendChild(meta);
  }
}

// Initialize security measures
export function initializeSecurity(): void {
  // Set up CSP
  setupCSP();
  
  // Disable right-click in production
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  // Disable F12 and other dev tools shortcuts in production
  if (import.meta.env.PROD) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    });
  }
  
  console.log('✅ Security measures initialized');
}

export default {
  sanitizeInput,
  isValidEmail,
  isValidUsername,
  containsInappropriateContent,
  validateImageFile,
  generateSecureId,
  isSafeUrl,
  isRateLimited,
  setupCSP,
  initializeSecurity
};