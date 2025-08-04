/**
 * Enhanced security utilities for AjnabiCam
 * Provides comprehensive security measures and threat detection
 */

interface SecurityConfig {
  enableCSP: boolean;
  enableXSSProtection: boolean;
  enableClickjackingProtection: boolean;
  enableContentTypeValidation: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private suspiciousActivityCount = 0;
  private lastSecurityCheck = Date.now();

  private constructor() {
    this.config = {
      enableCSP: true,
      enableXSSProtection: true,
      enableClickjackingProtection: true,
      enableContentTypeValidation: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    };
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  initialize(): void {
    this.setupContentSecurityPolicy();
    this.setupXSSProtection();
    this.setupClickjackingProtection();
    this.setupInputValidation();
    this.setupSecurityMonitoring();
    console.log('🔒 Enhanced security measures initialized');
  }

  private setupContentSecurityPolicy(): void {
    if (!this.config.enableCSP) return;

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://checkout.razorpay.com https://unityads.unity3d.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss: https://*.firebaseapp.com https://*.googleapis.com",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }

  private setupXSSProtection(): void {
    if (!this.config.enableXSSProtection) return;

    // Sanitize all user inputs
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.value) {
        target.value = this.sanitizeInput(target.value);
      }
    });
  }

  private setupClickjackingProtection(): void {
    if (!this.config.enableClickjackingProtection) return;

    // Prevent the page from being embedded in frames
    if (window.top !== window.self) {
      window.top!.location = window.self.location;
    }
  }

  private setupInputValidation(): void {
    // Override common DOM methods to add validation
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name: string, value: string) {
      if (name.toLowerCase().startsWith('on') || value.includes('javascript:')) {
        console.warn('🚨 Blocked potentially malicious attribute:', name, value);
        return;
      }
      return originalSetAttribute.call(this, name, value);
    };
  }

  private setupSecurityMonitoring(): void {
    // Monitor for suspicious activity
    setInterval(() => {
      this.performSecurityCheck();
    }, 30000); // Every 30 seconds

    // Monitor for console access (potential debugging attempts)
    let devtools = false;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true;
          this.logSuspiciousActivity('Developer tools opened');
        }
      } else {
        devtools = false;
      }
    }, 1000);
  }

  private performSecurityCheck(): void {
    const now = Date.now();
    
    // Check for rapid-fire requests (potential bot activity)
    const timeSinceLastCheck = now - this.lastSecurityCheck;
    if (timeSinceLastCheck < 1000) {
      this.suspiciousActivityCount++;
      if (this.suspiciousActivityCount > 10) {
        this.logSuspiciousActivity('Rapid request pattern detected');
      }
    } else {
      this.suspiciousActivityCount = 0;
    }
    
    this.lastSecurityCheck = now;
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Validate file uploads
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!this.config.allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${this.config.allowedFileTypes.join(', ')}`
      };
    }

    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(this.config.maxFileSize / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check for malicious file names
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.php$/i,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return {
        valid: false,
        error: 'File type appears to be executable and is not allowed'
      };
    }

    return { valid: true };
  }

  // Validate URLs
  validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTPS and HTTP
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Block known malicious domains
      const blockedDomains = [
        'malicious-site.com',
        'phishing-site.com',
        'suspicious-domain.net',
      ];
      
      return !blockedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch (error) {
      return false;
    }
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash sensitive data
  async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Log suspicious activity
  private logSuspiciousActivity(activity: string): void {
    console.warn('🚨 Suspicious activity detected:', activity);
    
    // Report to monitoring service
    try {
      import('./errorMonitoring').then(({ default: errorMonitoring }) => {
        errorMonitoring.reportError({
          message: `Security alert: ${activity}`,
          userAgent: navigator.userAgent,
          url: window.location.href,
          severity: 'medium',
          category: 'security',
          metadata: {
            suspiciousActivity: activity,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
          timestamp: new Date(),
        });
      });
    } catch (error) {
      console.error('Failed to report security incident:', error);
    }
  }

  // Check for common attack patterns
  detectAttackPatterns(input: string): boolean {
    const attackPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i,
      /&#x/i,
      /%3cscript/i,
      /eval\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
    ];

    return attackPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting for client-side actions
  private actionCounts = new Map<string, { count: number; resetTime: number }>();

  isActionRateLimited(action: string, maxActions: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const actionData = this.actionCounts.get(action);

    if (!actionData || now > actionData.resetTime) {
      this.actionCounts.set(action, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (actionData.count >= maxActions) {
      this.logSuspiciousActivity(`Rate limit exceeded for action: ${action}`);
      return true;
    }

    actionData.count++;
    return false;
  }

  // Get security status
  getSecurityStatus(): any {
    return {
      cspEnabled: this.config.enableCSP,
      xssProtectionEnabled: this.config.enableXSSProtection,
      clickjackingProtectionEnabled: this.config.enableClickjackingProtection,
      suspiciousActivityCount: this.suspiciousActivityCount,
      lastSecurityCheck: new Date(this.lastSecurityCheck).toISOString(),
      isSecureContext: window.isSecureContext,
      hasServiceWorker: 'serviceWorker' in navigator,
    };
  }
}

// React hook for security
export function useSecurity() {
  const securityManager = SecurityManager.getInstance();

  React.useEffect(() => {
    securityManager.initialize();
  }, []);

  return {
    sanitizeInput: securityManager.sanitizeInput.bind(securityManager),
    validateFile: securityManager.validateFile.bind(securityManager),
    validateURL: securityManager.validateURL.bind(securityManager),
    generateSecureToken: securityManager.generateSecureToken.bind(securityManager),
    hashData: securityManager.hashData.bind(securityManager),
    detectAttackPatterns: securityManager.detectAttackPatterns.bind(securityManager),
    isActionRateLimited: securityManager.isActionRateLimited.bind(securityManager),
    getSecurityStatus: securityManager.getSecurityStatus.bind(securityManager),
  };
}

export default SecurityManager;