import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting configuration
 */
export const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limiting for sensitive endpoints
  strict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: {
      error: 'Too many sensitive requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Chat connection rate limiting
  chatConnect: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 chat connections per 5 minutes
    message: {
      error: 'Too many chat connection attempts, please wait before trying again.',
      retryAfter: '5 minutes'
    },
  }),

  // Socket connection rate limiting
  socketConnect: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 socket events per minute
    message: {
      error: 'Too many socket events, please slow down.',
      retryAfter: '1 minute'
    },
  }),
};

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://ajnabicam.com',
      'https://www.ajnabicam.com',
      'https://app.ajnabicam.com',
      // Add your production domains here
    ];

    // In development, allow any localhost origin
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

/**
 * Helmet security configuration
 */
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "https://www.gstatic.com"],
      connectSrc: ["'self'", "https:", "wss:"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for WebRTC compatibility
};

/**
 * Input validation middleware
 */
export function validateInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize common fields
  if (req.body) {
    // Remove potential XSS attempts
    const sanitizeString = (str: string): string => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };

    req.body = sanitizeObject(req.body);
  }

  next();
}

/**
 * IP whitelist/blacklist middleware
 */
export function ipFilter(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || '';
  
  // Blacklisted IPs (add known malicious IPs)
  const blacklistedIPs = [
    // Add blacklisted IPs here
  ];

  if (blacklistedIPs.includes(clientIP)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked'
    });
  }

  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.php$/,
    /\.asp$/,
    /\.jsp$/,
    /admin/i,
    /wp-admin/i,
    /phpmyadmin/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    console.warn(`🚨 Suspicious request detected: ${method} ${url} from ${ip}`);
  }

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request too large',
      message: 'The request payload is too large'
    });
  }

  if (err.code === 'CORS_ERROR') {
    return res.status(403).json({
      error: 'CORS error',
      message: 'Cross-origin request not allowed'
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isProduction ? 'Something went wrong' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
}

/**
 * Apply all security middleware
 */
export function applySecurity(app: any) {
  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);
  
  // Apply security headers
  app.use(helmet(helmetOptions));
  app.use(securityHeaders);
  
  // Apply CORS
  app.use(cors(corsOptions));
  
  // Request logging
  app.use(requestLogger);
  
  // IP filtering
  app.use(ipFilter);
  
  // Input validation
  app.use(validateInput);
  
  // Rate limiting
  app.use('/api/', rateLimiters.general);
  app.use('/api/auth/', rateLimiters.strict);
  app.use('/api/chat/', rateLimiters.chatConnect);
  
  console.log('✅ Security middleware applied');
}
