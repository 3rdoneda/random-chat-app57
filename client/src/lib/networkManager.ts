/**
 * Network management utilities for AjnabiCam
 * Handles network connectivity, retry logic, and offline functionality
 */

interface NetworkConfig {
  retryAttempts: number;
  retryDelay: number;
  timeoutMs: number;
  enableOfflineMode: boolean;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

class NetworkManager {
  private static instance: NetworkManager;
  private config: NetworkConfig;
  private isOnline = navigator.onLine;
  private requestQueue: Array<{ url: string; options: RequestOptions; resolve: Function; reject: Function }> = [];

  private constructor() {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      timeoutMs: 10000,
      enableOfflineMode: true,
    };
    
    this.setupNetworkListeners();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Network connection restored');
      this.isOnline = true;
      this.processQueuedRequests();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Network connection lost');
      this.isOnline = false;
    });
  }

  // Enhanced fetch with retry logic and timeout
  async fetch(url: string, options: RequestOptions = {}): Promise<Response> {
    const {
      timeout = this.config.timeoutMs,
      retries = this.config.retryAttempts,
      ...fetchOptions
    } = options;

    // If offline and offline mode enabled, queue the request
    if (!this.isOnline && this.config.enableOfflineMode) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ url, options, resolve, reject });
      });
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          if (error.message.includes('404') || error.message.includes('401')) {
            throw error;
          }
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  // Process queued requests when network comes back online
  private async processQueuedRequests(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    console.log(`🔄 Processing ${this.requestQueue.length} queued requests`);

    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const { url, options, resolve, reject } of requests) {
      try {
        const response = await this.fetch(url, options);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
  }

  // Check network connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await this.fetch('/api/health', {
        timeout: 5000,
        retries: 1,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get network information
  getNetworkInfo(): any {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: this.isOnline,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      queuedRequests: this.requestQueue.length,
    };
  }

  // Preload critical resources
  async preloadCriticalResources(): Promise<void> {
    const criticalUrls = [
      '/api/config',
      '/sounds/join.mp3',
      '/sounds/match.mp3',
      '/sounds/swipe.mp3',
    ];

    const promises = criticalUrls.map(url => 
      this.fetch(url, { retries: 1 }).catch(error => {
        console.warn(`Failed to preload ${url}:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  // Cleanup
  cleanup(): void {
    this.requestQueue = [];
    window.removeEventListener('online', this.processQueuedRequests);
    window.removeEventListener('offline', () => {});
  }
}

// React hook for network management
export function useNetworkManager() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = React.useState<any>(null);
  const networkManager = NetworkManager.getInstance();

  React.useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      setNetworkInfo(networkManager.getNetworkInfo());
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Initial update
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [networkManager]);

  return {
    isOnline,
    networkInfo,
    fetch: networkManager.fetch.bind(networkManager),
    checkConnectivity: networkManager.checkConnectivity.bind(networkManager),
  };
}

export default NetworkManager;