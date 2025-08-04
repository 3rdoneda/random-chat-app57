/**
 * Comprehensive Ad Management Service for AjnabiCam
 * Supports Google AdSense, AdMob, and custom ad networksimport { auth, 
 */

export interface AdConfig {
  publisherId: string;
  adUnitIds: {
    banner: string;
    interstitial: string;
    rewarded: string;
    native: string;
  };
  testMode: boolean;
}

export interface AdPlacement {
  id: string;
  type: 'banner' | 'interstitial' | 'rewarded' | 'native';
  position: 'top' | 'bottom' | 'sidebar' | 'fullscreen' | 'inline';
  size?: {
    width: number;
    height: number;
  };
}

export interface RewardedAdResult {
  success: boolean;
  rewardAmount: number;
  rewardType: 'coins' | 'premium_time' | 'ad_free_time';
  error?: string;
}

class AdService {
  private static instance: AdService;
  private config: AdConfig;
  private isInitialized = false;
  private adBlockDetected = false;
  private consentGiven = false;

  // Default configuration for AjnabiCam
  private defaultConfig: AdConfig = {
      publisherId: import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
adUnitIds: {
  banner: import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-1776596266948987/2770517385',
  interstitial: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712',
  rewarded: import.meta.env.VITE_ADMOB_REWARDED_ID || 'ca-app-pub-1776596266948987/2777206492',
  native: import.meta.env.VITE_ADMOB_NATIVE_ID || 'ca-app-pub-3940256099942544/2247696110'
},
testMode: import.meta.env.DEV

  };

  private constructor() {
    this.config = this.defaultConfig;
  }

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  /**
   * Initialize the ad service with Google AdSense
   */
  async initialize(customConfig?: Partial<AdConfig>): Promise<boolean> {
    try {
      if (customConfig) {
        this.config = { ...this.config, ...customConfig };
      }

      console.log('🎯 Initializing Ad Service...');

      // Check for ad blockers (non-blocking)
      try {
        await this.detectAdBlocker();
      } catch (error) {
        console.warn('⚠️ Ad blocker detection failed, continuing...', error);
        this.adBlockDetected = false;
      }

      if (this.adBlockDetected) {
        console.warn('⚠️ Ad blocker detected - ads will not be shown');
        this.isInitialized = true; // Still mark as initialized for graceful fallback
        return true;
      }

      // Load Google AdSense script (non-blocking)
      try {
        await this.loadAdSenseScript();

        // Initialize AdSense
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle = window.adsbygoogle || [];
          this.isInitialized = true;
          console.log('✅ Ad Service initialized successfully');
          return true;
        }
      } catch (error) {
        console.warn('⚠️ AdSense failed to load, continuing without ads:', error);
        this.isInitialized = true; // Mark as initialized for graceful fallback
        return true;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Ad Service initialization error (non-critical):', error);
      this.isInitialized = true; // Always mark as initialized to not block app
      return true; // Return true to prevent blocking app startup
    }
  }

  /**
   * Request user consent for ads (GDPR compliance)
   */
  async requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simple consent dialog - you might want to use a proper consent management platform
      const consent = confirm(
        '🎯 AjnabiCam uses ads to provide free service.\n\n' +
        'We may use cookies and collect data to show personalized ads.\n' +
        'You can upgrade to Premium to remove ads.\n\n' +
        'Do you consent to personalized advertisements?'
      );

      this.consentGiven = consent;
      
      if (consent) {
        localStorage.setItem('ajnabicam_ad_consent', 'true');
        localStorage.setItem('ajnabicam_ad_consent_date', new Date().toISOString());
      }

      resolve(consent);
    });
  }

  /**
   * Check if user has previously given consent
   */
  hasConsent(): boolean {
    const consent = localStorage.getItem('ajnabicam_ad_consent');
    const consentDate = localStorage.getItem('ajnabicam_ad_consent_date');
    
    if (!consent || !consentDate) return false;
    
    // Check if consent is less than 1 year old
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return new Date(consentDate) > oneYearAgo;
  }

  /**
   * Load banner ad
   */
  async loadBannerAd(containerId: string, placement: AdPlacement, customAdUnitId?: string): Promise<boolean> {
    if (!this.canShowAds()) return false;

    try {
      const container = document.getElementById(containerId);
      if (!container) throw new Error(`Container ${containerId} not found`);

      // Clear previous content
      container.innerHTML = '';

      // Create ad element
      const adElement = document.createElement('ins');
      adElement.className = 'adsbygoogle';
      adElement.style.display = 'block';
      adElement.setAttribute('data-ad-client', this.config.publisherId);
      adElement.setAttribute('data-ad-slot', customAdUnitId || this.config.adUnitIds.banner);
      
      if (placement.size) {
        adElement.style.width = `${placement.size.width}px`;
        adElement.style.height = `${placement.size.height}px`;
        adElement.setAttribute('data-ad-format', 'rectangle');
      } else {
        adElement.setAttribute('data-ad-format', 'auto');
        adElement.setAttribute('data-full-width-responsive', 'true');
      }

      container.appendChild(adElement);

      // Push to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});

      console.log('📱 Banner ad loaded:', containerId);
      return true;
    } catch (error) {
      console.error('❌ Failed to load banner ad:', error);
      return false;
    }
  }

  /**
   * Show interstitial ad (between video calls)
   */
  async showInterstitialAd(): Promise<boolean> {
    if (!this.canShowAds()) return false;

    try {
      console.log('🎬 Showing interstitial ad...');
      
      // For web, we'll create a fullscreen overlay ad
      return new Promise((resolve) => {
        const overlay = this.createInterstitialOverlay();
        document.body.appendChild(overlay);

        // Auto-close after 5 seconds or user interaction
        const closeAd = () => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          resolve(true);
        };

        setTimeout(closeAd, 5000);
        
        overlay.addEventListener('click', closeAd);
      });
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
      return false;
    }
  }

  /**
   * Show rewarded video ad for earning coins
   */
  async showRewardedAd(): Promise<RewardedAdResult> {
    if (!this.canShowAds()) {
      return { success: false, rewardAmount: 0, rewardType: 'coins', error: 'Ads not available' };
    }

    try {
      console.log('💰 Showing rewarded ad...');

      // Simulate rewarded ad - in production, integrate with actual ad network
      return new Promise((resolve) => {
        const result = this.createRewardedAdExperience();
        resolve(result);
      });
    } catch (error) {
      console.error('❌ Failed to show rewarded ad:', error);
      return { success: false, rewardAmount: 0, rewardType: 'coins', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Load native ad (blends with content)
   */
  async loadNativeAd(containerId: string): Promise<boolean> {
    if (!this.canShowAds()) return false;

    try {
      const container = document.getElementById(containerId);
      if (!container) throw new Error(`Container ${containerId} not found`);

      container.innerHTML = this.createNativeAdHTML();
      console.log('📰 Native ad loaded:', containerId);
      return true;
    } catch (error) {
      console.error('❌ Failed to load native ad:', error);
      return false;
    }
  }

  /**
   * Check if ads can be shown (no ad blocker, consent given, etc.)
   */
  private canShowAds(): boolean {
    if (!this.isInitialized) {
      console.warn('⚠️ Ad Service not initialized');
      return false;
    }

    if (this.adBlockDetected) {
      console.warn('⚠️ Ad blocker detected');
      return false;
    }

    if (!this.hasConsent()) {
      console.warn('⚠️ User consent not given');
      return false;
    }

    return true;
  }

  /**
   * Detect ad blockers
   */
  private async detectAdBlocker(): Promise<void> {
    try {
      // Create a bait element that ad blockers typically block
      const bait = document.createElement('div');
      bait.innerHTML = '&nbsp;';
      bait.className = 'adsbox';
      bait.style.position = 'absolute';
      bait.style.left = '-10000px';
      document.body.appendChild(bait);

      await new Promise(resolve => setTimeout(resolve, 100));

      this.adBlockDetected = bait.offsetHeight === 0;
      document.body.removeChild(bait);
    } catch (error) {
      console.warn('Could not detect ad blocker:', error);
      this.adBlockDetected = false;
    }
  }

  /**
   * Load Google AdSense script
   */
  private loadAdSenseScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="pagead/js/adsbygoogle.js"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.publisherId}`;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load AdSense script'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Create interstitial overlay for web
   */
  private createInterstitialOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    `;

    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 40px;
        border-radius: 10px;
        text-align: center;
        max-width: 400px;
        margin: 20px;
      ">
        <h2 style="color: #ff6b6b; margin-bottom: 20px;">💕 Support AjnabiCam</h2>
        <p style="margin-bottom: 20px;">Thanks for using our free service!</p>
        <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p style="font-size: 14px; color: #666;">Advertisement</p>
          <p style="font-size: 18px; margin: 10px 0;">🎬 Sample Ad Content</p>
          <p style="font-size: 12px; color: #999;">Click anywhere to continue</p>
        </div>
        <p style="font-size: 12px; color: #999;">Ad will close automatically in 5 seconds</p>
      </div>
    `;

    return overlay;
  }

  /**
   * Create rewarded ad experience
   */
  private createRewardedAdExperience(): Promise<RewardedAdResult> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      let watchTime = 0;
      const requiredWatchTime = 3; // 3 seconds minimum

      overlay.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 15px;
          text-align: center;
          max-width: 400px;
          margin: 20px;
        ">
          <h2 style="margin-bottom: 20px;">💰 Earn 10 Coins!</h2>
          <p style="margin-bottom: 20px;">Watch this ad to earn coins</p>
          <div id="ad-content" style="background: rgba(255,255,255,0.1); padding: 30px; margin: 20px 0; border-radius: 10px;">
            <p style="font-size: 18px; margin: 10px 0;">🎬 Rewarded Video Ad</p>
            <p id="countdown" style="font-size: 14px;">Watch for ${requiredWatchTime} seconds...</p>
          </div>
          <button id="claim-reward" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            opacity: 0.5;
            font-size: 16px;
          " disabled>Claim Reward</button>
        </div>
      `;

      document.body.appendChild(overlay);

      const countdownEl = overlay.querySelector('#countdown');
      const claimBtn = overlay.querySelector('#claim-reward') as HTMLButtonElement;

      const timer = setInterval(() => {
        watchTime++;
        if (countdownEl) {
          countdownEl.textContent = `${Math.max(0, requiredWatchTime - watchTime)} seconds remaining...`;
        }

        if (watchTime >= requiredWatchTime) {
          clearInterval(timer);
          if (claimBtn && countdownEl) {
            claimBtn.disabled = false;
            claimBtn.style.opacity = '1';
            countdownEl.textContent = 'Ready to claim!';
          }
        }
      }, 1000);

      claimBtn.addEventListener('click', () => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        clearInterval(timer);
        resolve({
          success: true,
          rewardAmount: 10,
          rewardType: 'coins'
        });
      });

      // Auto-close after 30 seconds
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        clearInterval(timer);
        resolve({
          success: false,
          rewardAmount: 0,
          rewardType: 'coins',
          error: 'Ad timeout'
        });
      }, 30000);
    });
  }

  /**
   * Create native ad HTML
   */
  private createNativeAdHTML(): string {
    return `
      <div style="
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        background: #f9f9f9;
        margin: 10px 0;
      ">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 12px; color: #666; background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">Ad</span>
        </div>
        <div style="display: flex; gap: 15px;">
          <div style="width: 80px; height: 80px; background: #ddd; border-radius: 5px; flex-shrink: 0;"></div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 5px 0; color: #333;">Sample Native Ad</h4>
            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.4;">
              This is a native ad that blends with your content. Click to learn more!
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get ad performance metrics
   */
  getMetrics() {
    return {
      adsShown: parseInt(localStorage.getItem('ajnabicam_ads_shown') || '0'),
      rewardedAdsWatched: parseInt(localStorage.getItem('ajnabicam_rewarded_ads') || '0'),
      adBlockerDetected: this.adBlockDetected,
      consentGiven: this.consentGiven,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Track ad events
   */
  trackAdEvent(event: string, adType: string) {
    console.log(`📊 Ad Event: ${event} - ${adType}`);
    
    // Increment counters
    if (event === 'shown') {
      const current = parseInt(localStorage.getItem('ajnabicam_ads_shown') || '0');
      localStorage.setItem('ajnabicam_ads_shown', (current + 1).toString());
    }
    
    if (event === 'rewarded') {
      const current = parseInt(localStorage.getItem('ajnabicam_rewarded_ads') || '0');
      localStorage.setItem('ajnabicam_rewarded_ads', (current + 1).toString());
    }
  }
}

// Extend window interface for AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdService;
export const adService = AdService.getInstance();
