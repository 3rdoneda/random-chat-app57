/**
 * Performance optimization utilities for AjnabiCam
 * Handles memory management, lazy loading, and performance monitoring
 */

interface PerformanceConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableMemoryCleanup: boolean;
  maxMemoryUsage: number; // in MB
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: PerformanceConfig;
  private memoryCheckInterval: number | null = null;
  private imageCache = new Map<string, HTMLImageElement>();
  private componentCache = new Map<string, React.ComponentType<any>>();

  private constructor() {
    this.config = {
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableMemoryCleanup: true,
      maxMemoryUsage: 100, // 100MB
    };
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  initialize(): void {
    this.setupMemoryMonitoring();
    this.setupImageOptimization();
    this.setupLazyLoading();
    console.log('✅ Performance optimizer initialized');
  }

  private setupMemoryMonitoring(): void {
    if (!this.config.enableMemoryCleanup) return;

    this.memoryCheckInterval = window.setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMB = memInfo.usedJSHeapSize / 1024 / 1024;
      
      if (usedMB > this.config.maxMemoryUsage) {
        console.warn(`⚠️ High memory usage detected: ${usedMB.toFixed(2)}MB`);
        this.performMemoryCleanup();
      }
    }
  }

  private performMemoryCleanup(): void {
    // Clear image cache
    this.imageCache.clear();
    
    // Clear component cache
    this.componentCache.clear();
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    console.log('🧹 Memory cleanup performed');
  }

  // Optimize images for better performance
  optimizeImage(src: string, maxWidth: number = 800): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(src);
            return;
          }

          // Calculate new dimensions
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          // Draw optimized image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to optimized format
          canvas.toBlob((blob) => {
            if (blob) {
              const optimizedUrl = URL.createObjectURL(blob);
              this.imageCache.set(src, img);
              resolve(optimizedUrl);
            } else {
              resolve(src);
            }
          }, 'image/webp', 0.8);
        } catch (error) {
          console.warn('Image optimization failed:', error);
          resolve(src);
        }
      };

      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  // Lazy load components
  lazyLoadComponent<T>(
    importFn: () => Promise<{ default: React.ComponentType<T> }>,
    fallback?: React.ComponentType
  ): React.ComponentType<T> {
    const cacheKey = importFn.toString();
    
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey)!;
    }

    const LazyComponent = React.lazy(importFn);
    
    const WrappedComponent: React.ComponentType<T> = (props) => (
      <React.Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    );

    this.componentCache.set(cacheKey, WrappedComponent);
    return WrappedComponent;
  }

  // Debounce function calls for better performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttle function calls
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Preload critical resources
  preloadResources(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          // Preload image
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
          // Preload audio
          const audio = new Audio();
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
          audio.src = url;
        } else {
          // Preload other resources
          fetch(url)
            .then(() => resolve())
            .catch(() => reject(new Error(`Failed to load resource: ${url}`)));
        }
      });
    });

    return Promise.allSettled(promises).then(() => []);
  }

  // Setup intersection observer for lazy loading
  private setupLazyLoading(): void {
    if (!this.config.enableLazyLoading || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const src = element.dataset.src;
          
          if (src && element.tagName === 'IMG') {
            (element as HTMLImageElement).src = src;
            element.removeAttribute('data-src');
            observer.unobserve(element);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }

  private setupImageOptimization(): void {
    if (!this.config.enableImageOptimization) return;

    // Optimize images on load
    document.addEventListener('DOMContentLoaded', () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src && !img.dataset.optimized) {
          this.optimizeImage(img.src).then(optimizedSrc => {
            if (optimizedSrc !== img.src) {
              img.src = optimizedSrc;
              img.dataset.optimized = 'true';
            }
          });
        }
      });
    });
  }

  // Get performance metrics
  getPerformanceMetrics(): any {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      memoryUsage: 'memory' in performance ? (performance as any).memory : null,
      cacheSize: {
        images: this.imageCache.size,
        components: this.componentCache.size
      }
    };
  }

  // Cleanup resources
  cleanup(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    
    this.performMemoryCleanup();
    console.log('🧹 Performance optimizer cleaned up');
  }
}

// React hook for performance optimization
export function usePerformanceOptimizer() {
  const optimizer = PerformanceOptimizer.getInstance();

  React.useEffect(() => {
    optimizer.initialize();
    return () => optimizer.cleanup();
  }, []);

  return {
    optimizeImage: optimizer.optimizeImage.bind(optimizer),
    debounce: optimizer.debounce.bind(optimizer),
    throttle: optimizer.throttle.bind(optimizer),
    preloadResources: optimizer.preloadResources.bind(optimizer),
    getMetrics: optimizer.getPerformanceMetrics.bind(optimizer),
  };
}

export default PerformanceOptimizer;