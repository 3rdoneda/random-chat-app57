/**
 * Performance monitoring utilities for AjnabiCam
 * Tracks app performance and user experience metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.trackInitialMetrics();
  }

  private initializeObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric(entry.name, entry.duration || entry.startTime);
          }
        });

        this.observer.observe({ 
          entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input'] 
        });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private trackInitialMetrics(): void {
    // Track page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.recordMetric('first_byte', navigation.responseStart - navigation.fetchStart);
      }
    });

    // Track Core Web Vitals
    this.trackCoreWebVitals();
  }

  private trackCoreWebVitals(): void {
    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('first_contentful_paint', entry.startTime);
        }
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('largest_contentful_paint', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('first_input_delay', entry.processingStart - entry.startTime);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.recordMetric('cumulative_layout_shift', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  public recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.push(metric);

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (import.meta.env.PROD) {
      this.sendToAnalytics(metric);
    }

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  private async sendToAnalytics(metric: PerformanceMetric): Promise<void> {
    try {
      // In a real app, send to your analytics service
      // For now, just log to console
      console.log('Sending performance metric to analytics:', metric);
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  public getPerformanceScore(): number {
    const fcp = this.getAverageMetric('first_contentful_paint');
    const lcp = this.getAverageMetric('largest_contentful_paint');
    const fid = this.getAverageMetric('first_input_delay');
    const cls = this.getAverageMetric('cumulative_layout_shift');

    // Calculate score based on Core Web Vitals thresholds
    let score = 100;

    // FCP scoring (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
    if (fcp > 3000) score -= 25;
    else if (fcp > 1800) score -= 10;

    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (lcp > 4000) score -= 25;
    else if (lcp > 2500) score -= 10;

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (fid > 300) score -= 25;
    else if (fid > 100) score -= 10;

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (cls > 0.25) score -= 25;
    else if (cls > 0.1) score -= 10;

    return Math.max(0, score);
  }

  public generateReport(): string {
    const score = this.getPerformanceScore();
    const fcp = this.getAverageMetric('first_contentful_paint');
    const lcp = this.getAverageMetric('largest_contentful_paint');
    const fid = this.getAverageMetric('first_input_delay');
    const cls = this.getAverageMetric('cumulative_layout_shift');

    return `
Performance Report:
- Overall Score: ${score}/100
- First Contentful Paint: ${fcp.toFixed(2)}ms
- Largest Contentful Paint: ${lcp.toFixed(2)}ms
- First Input Delay: ${fid.toFixed(2)}ms
- Cumulative Layout Shift: ${cls.toFixed(3)}
    `.trim();
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics = [];
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const recordMetric = (name: string, value: number) => {
    performanceMonitor.recordMetric(name, value);
  };

  const getReport = () => {
    return performanceMonitor.generateReport();
  };

  const getScore = () => {
    return performanceMonitor.getPerformanceScore();
  };

  return {
    recordMetric,
    getReport,
    getScore,
    getMetrics: () => performanceMonitor.getMetrics()
  };
}

export default performanceMonitor;