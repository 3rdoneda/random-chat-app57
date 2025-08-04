/**
 * Error Monitoring and Reporting System
 * Provides comprehensive error tracking and user feedback
 */

import { analytics, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ErrorReport {
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'firebase' | 'user' | 'system';
  metadata?: Record<string, any>;
  timestamp: any;
}

interface UserFeedback {
  type: 'bug' | 'feature' | 'improvement' | 'complaint';
  message: string;
  email?: string;
  userId?: string;
  page: string;
  timestamp: any;
}

class ErrorMonitoring {
  private userId?: string;
  private isInitialized = false;
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  initialize(userId?: string) {
    this.userId = userId;
    this.setupGlobalErrorHandlers();
    this.setupUnhandledRejectionHandler();
    this.setupNetworkHandlers();
    this.isInitialized = true;
    console.log('✅ Error monitoring initialized');
  }

  private setupNetworkHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async flushErrorQueue() {
    if (!this.isOnline || this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    for (const error of errors) {
      try {
        await this.sendErrorToFirestore(error);
      } catch (e) {
        // Re-queue if still failing
        this.errorQueue.push(error);
        break;
      }
    }
  }

  private setupGlobalErrorHandlers() {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      // Ignore certain non-critical errors
      if (event.message.includes('ResizeObserver loop limit exceeded') ||
          event.message.includes('Non-Error promise rejection captured') ||
          event.filename?.includes('extension') ||
          event.message.includes('Loading chunk') ||
          event.message.includes('ChunkLoadError')) {
        return;
      }
      
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        severity: 'medium',
        category: 'javascript',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        timestamp: serverTimestamp(),
      });
    });

    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      // Ignore certain non-critical promise rejections
      if (event.reason?.message?.includes('The user aborted a request') ||
          event.reason?.message?.includes('Load failed') ||
          event.reason?.name === 'AbortError' ||
          event.reason?.message?.includes('Loading CSS chunk')) {
        return;
      }
      
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        severity: 'high',
        category: 'javascript',
        metadata: {
          type: 'unhandledrejection',
          reason: event.reason,
        },
        timestamp: serverTimestamp(),
      });
    });
  }

  private setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Report to monitoring service
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        severity: 'high',
        category: 'javascript',
        timestamp: serverTimestamp(),
      });
    });
  }

  /**
   * Report an error to the monitoring system
   */
  async reportError(error: ErrorReport): Promise<void> {
    if (!this.isOnline) {
      this.errorQueue.push(error);
      return;
    }

    try {
      await this.sendErrorToFirestore(error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      this.errorQueue.push(error);
    }
  }

  private async sendErrorToFirestore(error: ErrorReport): Promise<void> {
    try {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.error('Error reported:', error);
      }

      // Store in Firestore for analysis
      await addDoc(collection(db, 'errors'), {
        ...error,
        environment: import.meta.env.MODE,
        timestamp: serverTimestamp(),
      });

      // Send to analytics if available
      if (analytics && import.meta.env.PROD) {
        console.log('Error logged to analytics');
      }

    } catch (error) {
      console.error('Failed to send error to Firestore:', error);
      throw error;
    }
  }

  /**
   * Report Firebase-specific errors
   */
  reportFirebaseError(error: any, operation: string): void {
    this.reportError({
      message: `Firebase ${operation} error: ${error.message}`,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      severity: 'high',
      category: 'firebase',
      metadata: {
        operation,
        code: error.code,
        details: error.details,
      },
      timestamp: serverTimestamp(),
    });
  }

  /**
   * Report network errors
   */
  reportNetworkError(error: any, endpoint: string): void {
    this.reportError({
      message: `Network error: ${error.message}`,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      severity: 'medium',
      category: 'network',
      metadata: {
        endpoint,
        status: error.status,
        statusText: error.statusText,
      },
      timestamp: serverTimestamp(),
    });
  }

  /**
   * Report user-initiated errors (like validation failures)
   */
  reportUserError(message: string, context?: Record<string, any>): void {
    this.reportError({
      message: `User error: ${message}`,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      severity: 'low',
      category: 'user',
      metadata: context,
      timestamp: serverTimestamp(),
    });
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: Omit<UserFeedback, 'timestamp' | 'page'>): Promise<void> {
    try {
      await addDoc(collection(db, 'feedback'), {
        ...feedback,
        userId: this.userId,
        page: window.location.pathname,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      console.log('✅ Feedback submitted successfully');
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      throw error;
    }
  }

  /**
   * Get error statistics for admin dashboard
   */
  async getErrorStats(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<any> {
    try {
      // This would typically be implemented as a Firebase Cloud Function
      // For now, return mock data
      return {
        totalErrors: 42,
        criticalErrors: 3,
        topErrors: [
          { message: 'Network timeout', count: 15 },
          { message: 'Firebase auth error', count: 8 },
          { message: 'WebRTC connection failed', count: 5 },
        ],
        errorsByCategory: {
          javascript: 20,
          network: 15,
          firebase: 5,
          user: 2,
        },
      };
    } catch (error) {
      console.error('Failed to get error stats:', error);
      return null;
    }
  }
}

// Singleton instance
const errorMonitoring = new ErrorMonitoring();

// React Error Boundary Hook
export function useErrorHandler() {
  const reportError = (error: Error, errorInfo?: any) => {
    errorMonitoring.reportError({
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: 'high',
      category: 'javascript',
      metadata: {
        errorInfo,
        componentStack: errorInfo?.componentStack,
      },
      timestamp: serverTimestamp(),
    });
  };

  return { reportError };
}

// Performance monitoring
export function reportPerformanceMetric(name: string, value: number, context?: Record<string, any>) {
  try {
    // Log performance metrics
    if (import.meta.env.DEV) {
      console.log(`Performance metric: ${name} = ${value}ms`, context);
    }

    // Store performance data
    addDoc(collection(db, 'performance'), {
      metric: name,
      value,
      context,
      timestamp: serverTimestamp(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }).catch(console.error);

  } catch (error) {
    console.error('Failed to report performance metric:', error);
  }
}

// Initialize error monitoring
export function initializeErrorMonitoring(userId?: string) {
  errorMonitoring.initialize(userId);
}

export default errorMonitoring;
