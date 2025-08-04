/**
 * Cache management utilities for AjnabiCam
 * Handles caching of user data, images, and app state
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set item in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };

    this.cache.set(key, item);

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    let item = this.cache.get(key);

    // If not in memory, try localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          if (item) {
            this.cache.set(key, item);
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    
    // Clear localStorage cache items
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; items: string[]; totalSize: number } {
    const items = Array.from(this.cache.keys());
    let totalSize = 0;

    try {
      items.forEach(key => {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          totalSize += stored.length;
        }
      });
    } catch (error) {
      console.warn('Failed to calculate cache size:', error);
    }

    return {
      size: this.cache.size,
      items,
      totalSize
    };
  }

  /**
   * Cleanup expired items
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));

    console.log(`🧹 Cache cleanup: removed ${expiredKeys.length} expired items`);
  }

  /**
   * Preload critical data
   */
  async preloadCriticalData(): Promise<void> {
    try {
      // Preload user profile data
      const userId = localStorage.getItem('ajnabicam_user_id');
      if (userId && !this.get(`user_profile_${userId}`)) {
        // In a real app, fetch from Firestore
        console.log('Preloading user profile data...');
      }

      // Preload app configuration
      if (!this.get('app_config')) {
        const config = {
          version: import.meta.env.VITE_APP_VERSION,
          features: {
            premiumEnabled: import.meta.env.VITE_ENABLE_PREMIUM_FEATURES === 'true',
            analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
          }
        };
        this.set('app_config', config, 24 * 60 * 60 * 1000); // 24 hours
      }
    } catch (error) {
      console.error('Failed to preload critical data:', error);
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// Initialize cache cleanup interval
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000); // Cleanup every 5 minutes

// Preload critical data on startup
cacheManager.preloadCriticalData();

export default cacheManager;

// React hook for cache management
export function useCache() {
  const set = <T>(key: string, data: T, ttl?: number) => {
    cacheManager.set(key, data, ttl);
  };

  const get = <T>(key: string): T | null => {
    return cacheManager.get<T>(key);
  };

  const remove = (key: string) => {
    cacheManager.delete(key);
  };

  const clear = () => {
    cacheManager.clear();
  };

  const getStats = () => {
    return cacheManager.getStats();
  };

  return {
    set,
    get,
    remove,
    clear,
    getStats
  };
}