/**
 * Unity Ads Service for AdMob Mediation
 * Integrates Unity LevelPlay with AdMob mediation
 */

export interface UnityAdsConfig {
  gameId: string;
  testMode: boolean;
  enablePerPlacementLoad: boolean;
  initializeInBackground: boolean;
}

export interface UnityAdPlacement {
  placementId: string;
  type: 'banner' | 'interstitial' | 'rewarded';
  size?: {
    width: number;
    height: number;
  };
}

export interface UnityRewardedResult {
  success: boolean;
  placementId: string;
  rewardAmount: number;
  skipped?: boolean;
  error?: string;
}

declare global {
  interface Window {
    UnityAds?: {
      initialize: (gameId: string, testMode: boolean, enablePerPlacementLoad: boolean, initializationListener: any) => void;
      isInitialized: () => boolean;
      show: (placementId: string, showListener: any) => void;
      load: (placementId: string, loadListener: any) => void;
      isReady: (placementId: string) => boolean;
      getPlacementState: (placementId: string) => string;
      addListener: (eventType: string, listener: any) => void;
      removeListener: (eventType: string, listener: any) => void;
    };
    unityShowAds?: any;
  }
}

class UnityAdsService {
  private static instance: UnityAdsService;
  private config: UnityAdsConfig;
  private isInitialized = false;
  private isSDKLoaded = false;
  private initializationPromise: Promise<boolean> | null = null;

  // Unity Ads configuration for AjnabiCam
  private defaultConfig: UnityAdsConfig = {
    gameId: import.meta.env.VITE_UNITY_GAME_ID || 'a1abc147-49d0-4a59-8b35-1acba00889f6', // Your Unity Project ID
    testMode: import.meta.env.DEV || false,
    enablePerPlacementLoad: true,
    initializeInBackground: true
  };

  // Unity Ad Placements for mediation
  private placements = {
    banner: import.meta.env.VITE_UNITY_BANNER_PLACEMENT || 'banner',
    interstitial: import.meta.env.VITE_UNITY_INTERSTITIAL_PLACEMENT || 'video',
    rewarded: import.meta.env.VITE_UNITY_REWARDED_PLACEMENT || 'rewardedVideo'
  };

  private constructor() {
    this.config = this.defaultConfig;
  }

  static getInstance(): UnityAdsService {
    if (!UnityAdsService.instance) {
      UnityAdsService.instance = new UnityAdsService();
    }
    return UnityAdsService.instance;
  }

  /**
   * Initialize Unity Ads SDK for mediation
   */
  async initialize(customConfig?: Partial<UnityAdsConfig>): Promise<boolean> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize(customConfig);
    return this.initializationPromise;
  }

  private async doInitialize(customConfig?: Partial<UnityAdsConfig>): Promise<boolean> {
    try {
      if (customConfig) {
        this.config = { ...this.config, ...customConfig };
      }

      console.log('🎮 Initializing Unity Ads for mediation...');
      console.log('📊 Game ID:', this.config.gameId);
      console.log('🧪 Test Mode:', this.config.testMode);

      // Load Unity Ads SDK
      await this.loadUnityAdsSDK();

      // Initialize Unity Ads
      if (window.UnityAds) {
        return new Promise((resolve) => {
          const initListener = {
            onInitializationComplete: () => {
              console.log('✅ Unity Ads initialized successfully');
              this.isInitialized = true;
              this.setupEventListeners();
              resolve(true);
            },
            onInitializationFailed: (error: any) => {
              console.error('❌ Unity Ads initialization failed:', error);
              this.isInitialized = false;
              resolve(false);
            }
          };

          window.UnityAds.initialize(
            this.config.gameId,
            this.config.testMode,
            this.config.enablePerPlacementLoad,
            initListener
          );
        });
      } else {
        console.error('❌ Unity Ads SDK not available');
        return false;
      }
    } catch (error) {
      console.error('❌ Unity Ads initialization error:', error);
      return false;
    }
  }

  /**
   * Load Unity Ads SDK script
   */
  private loadUnityAdsSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isSDKLoaded || document.querySelector('script[src*="unityads.unity3d.com"]')) {
        this.isSDKLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://unityads.unity3d.com/webview/2.0/UnityAds.js';
      
      script.onload = () => {
        console.log('📱 Unity Ads SDK loaded');
        this.isSDKLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Unity Ads SDK');
        reject(new Error('Failed to load Unity Ads SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Setup Unity Ads event listeners
   */
  private setupEventListeners(): void {
    if (!window.UnityAds) return;

    // Add global event listeners for better tracking
    window.UnityAds.addListener('onUnityAdsReady', (placementId: string) => {
      console.log('🎮 Unity Ad ready:', placementId);
    });

    window.UnityAds.addListener('onUnityAdsStart', (placementId: string) => {
      console.log('▶️ Unity Ad started:', placementId);
    });

    window.UnityAds.addListener('onUnityAdsFinish', (placementId: string, finishState: string) => {
      console.log('🏁 Unity Ad finished:', placementId, finishState);
    });

    window.UnityAds.addListener('onUnityAdsError', (error: any) => {
      console.error('❌ Unity Ad error:', error);
    });
  }

  /**
   * Check if Unity Ads is ready for a specific placement
   */
  isReady(placementType: 'banner' | 'interstitial' | 'rewarded'): boolean {
    if (!this.isInitialized || !window.UnityAds) {
      return false;
    }

    const placementId = this.placements[placementType];
    return window.UnityAds.isReady(placementId);
  }

  /**
   * Load Unity banner ad (for mediation)
   */
  async loadBannerAd(containerId: string, placement: UnityAdPlacement): Promise<boolean> {
    if (!this.canShowAds()) {
      return false;
    }

    try {
      console.log('🎮 Loading Unity banner ad...');
      
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }

      // For web, Unity Ads doesn't support banner ads directly
      // We'll create a placeholder that can be filled by mediation
      const bannerElement = this.createUnityBannerPlaceholder();
      container.innerHTML = '';
      container.appendChild(bannerElement);

      console.log('✅ Unity banner placeholder created');
      return true;
    } catch (error) {
      console.error('❌ Unity banner ad failed:', error);
      return false;
    }
  }

  /**
   * Show Unity interstitial ad (for mediation)
   */
  async showInterstitialAd(): Promise<boolean> {
    if (!this.canShowAds()) {
      return false;
    }

    try {
      console.log('🎮 Showing Unity interstitial ad...');
      
      const placementId = this.placements.interstitial;
      
      if (!this.isReady('interstitial')) {
        console.warn('⚠️ Unity interstitial not ready, attempting to load...');
        await this.loadAd(placementId);
      }

      return new Promise((resolve) => {
        const showListener = {
          onUnityAdsShowStart: (placementId: string) => {
            console.log('▶️ Unity interstitial started:', placementId);
          },
          onUnityAdsShowClick: (placementId: string) => {
            console.log('👆 Unity interstitial clicked:', placementId);
          },
          onUnityAdsShowComplete: (placementId: string, showCompletionState: string) => {
            console.log('✅ Unity interstitial completed:', placementId, showCompletionState);
            resolve(true);
          },
          onUnityAdsShowFailure: (placementId: string, error: any) => {
            console.error('❌ Unity interstitial failed:', placementId, error);
            resolve(false);
          }
        };

        if (window.UnityAds) {
          window.UnityAds.show(placementId, showListener);
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      console.error('❌ Unity interstitial error:', error);
      return false;
    }
  }

  /**
   * Show Unity rewarded ad (for mediation)
   */
  async showRewardedAd(): Promise<UnityRewardedResult> {
    if (!this.canShowAds()) {
      return {
        success: false,
        placementId: this.placements.rewarded,
        rewardAmount: 0,
        error: 'Unity Ads not available'
      };
    }

    try {
      console.log('🎮 Showing Unity rewarded ad...');
      
      const placementId = this.placements.rewarded;
      
      if (!this.isReady('rewarded')) {
        console.warn('⚠️ Unity rewarded ad not ready, attempting to load...');
        await this.loadAd(placementId);
      }

      return new Promise((resolve) => {
        const showListener = {
          onUnityAdsShowStart: (placementId: string) => {
            console.log('▶️ Unity rewarded ad started:', placementId);
          },
          onUnityAdsShowClick: (placementId: string) => {
            console.log('👆 Unity rewarded ad clicked:', placementId);
          },
          onUnityAdsShowComplete: (placementId: string, showCompletionState: string) => {
            console.log('✅ Unity rewarded ad completed:', placementId, showCompletionState);
            
            const success = showCompletionState === 'COMPLETED';
            const skipped = showCompletionState === 'SKIPPED';
            
            resolve({
              success,
              placementId,
              rewardAmount: success ? 15 : 0, // Unity typically gives higher rewards
              skipped
            });
          },
          onUnityAdsShowFailure: (placementId: string, error: any) => {
            console.error('❌ Unity rewarded ad failed:', placementId, error);
            resolve({
              success: false,
              placementId,
              rewardAmount: 0,
              error: error.toString()
            });
          }
        };

        if (window.UnityAds) {
          window.UnityAds.show(placementId, showListener);
        } else {
          resolve({
            success: false,
            placementId,
            rewardAmount: 0,
            error: 'Unity Ads SDK not available'
          });
        }
      });
    } catch (error) {
      console.error('❌ Unity rewarded ad error:', error);
      return {
        success: false,
        placementId: this.placements.rewarded,
        rewardAmount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Load specific Unity ad placement
   */
  private async loadAd(placementId: string): Promise<boolean> {
    if (!window.UnityAds) return false;

    return new Promise((resolve) => {
      const loadListener = {
        onUnityAdsAdLoaded: (placementId: string) => {
          console.log('✅ Unity ad loaded:', placementId);
          resolve(true);
        },
        onUnityAdsFailedToLoad: (placementId: string, error: any) => {
          console.error('❌ Unity ad failed to load:', placementId, error);
          resolve(false);
        }
      };

      window.UnityAds.load(placementId, loadListener);
      
      // Timeout after 10 seconds
      setTimeout(() => resolve(false), 10000);
    });
  }

  /**
   * Create Unity banner placeholder for mediation
   */
  private createUnityBannerPlaceholder(): HTMLElement {
    const banner = document.createElement('div');
    banner.style.cssText = `
      width: 100%;
      height: 90px;
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
      position: relative;
      overflow: hidden;
    `;

    banner.innerHTML = `
      <div style="text-align: center; z-index: 2;">
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">
          🎮 Unity Ads
        </div>
        <div style="font-size: 10px; opacity: 0.9;">
          Mediated through AdMob
        </div>
      </div>
      <div style="
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        animation: float 3s ease-in-out infinite;
        z-index: 1;
      "></div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(2px, -2px) rotate(1deg); }
        66% { transform: translate(-2px, 2px) rotate(-1deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
    `;
    document.head.appendChild(style);

    return banner;
  }

  /**
   * Check if Unity Ads can show ads
   */
  private canShowAds(): boolean {
    if (!this.isInitialized) {
      console.warn('⚠️ Unity Ads not initialized');
      return false;
    }

    if (!window.UnityAds) {
      console.warn('⚠️ Unity Ads SDK not available');
      return false;
    }

    return true;
  }

  /**
   * Get Unity Ads metrics for mediation optimization
   */
  getMetrics() {
    return {
      isInitialized: this.isInitialized,
      isSDKLoaded: this.isSDKLoaded,
      gameId: this.config.gameId,
      testMode: this.config.testMode,
      placementStates: {
        banner: this.isReady('banner'),
        interstitial: this.isReady('interstitial'),
        rewarded: this.isReady('rewarded')
      },
      estimatedECPM: {
        banner: 1.8,
        interstitial: 4.2,
        rewarded: 9.5
      },
      fillRate: 0.92 // Unity typically has 92% fill rate
    };
  }

  /**
   * Get Unity Ads mediation configuration for AdMob
   */
  getMediationConfig() {
    return {
      networkName: 'Unity Ads',
      networkId: 'unity',
      gameId: this.config.gameId,
      placements: this.placements,
      priority: 2, // High priority in mediation waterfall
      eCPMFloor: {
        banner: 1.5,
        interstitial: 3.0,
        rewarded: 8.0
      },
      geoTargeting: {
        tier1: { multiplier: 1.5, countries: ['US', 'CA', 'GB', 'AU'] },
        tier2: { multiplier: 1.2, countries: ['DE', 'FR', 'JP', 'KR'] },
        tier3: { multiplier: 1.0, countries: ['IN', 'BR', 'MX', 'PH'] }
      }
    };
  }

  /**
   * Optimize Unity Ads for better performance
   */
  optimizeForMediation() {
    console.log('🎯 Optimizing Unity Ads for mediation...');
    
    // Pre-load ads for better fill rates
    if (this.isInitialized && window.UnityAds) {
      Object.values(this.placements).forEach(placementId => {
        if (!window.UnityAds!.isReady(placementId)) {
          this.loadAd(placementId);
        }
      });
    }

    // Log optimization metrics
    const metrics = this.getMetrics();
    console.log('📊 Unity Ads Metrics:', metrics);
  }
}

export default UnityAdsService;
export const unityAdsService = UnityAdsService.getInstance();
