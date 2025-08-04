/**
 * Haptic Feedback Utility for Native Mobile App Experience
 * Provides haptic feedback for touch interactions on supported devices
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

interface HapticFeedback {
  vibrate?: (pattern?: number | number[]) => void;
}

// We don't need to redeclare Navigator.vibrate as it's already defined in lib.dom.d.ts
// Just use the existing type definition

class HapticsService {
  private isSupported: boolean = false;
  private isIOSDevice: boolean = false;

  constructor() {
    this.isSupported = this.checkSupport();
    this.isIOSDevice = this.checkIOSDevice();
  }

  private checkSupport(): boolean {
    return 'vibrate' in navigator || 'webkitVibrate' in navigator;
  }

  private checkIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Trigger haptic feedback based on type
   */
  public impact(type: HapticType = 'medium'): void {
    if (!this.isSupported) return;

    try {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        selection: [5],
        impact: [15],
        notification: [10, 50, 10]
      };

      const pattern = patterns[type] || patterns.medium;
      
      if (navigator.vibrate && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Success haptic pattern
   */
  public success(): void {
    this.impact('notification');
  }

  /**
   * Error haptic pattern
   */
  public error(): void {
    if (!this.isSupported) return;
    
    try {
      if (navigator.vibrate && typeof navigator.vibrate === 'function') {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error) {
      console.warn('Error haptic feedback failed:', error);
    }
  }

  /**
   * Button tap haptic
   */
  public buttonTap(): void {
    this.impact('light');
  }

  /**
   * Selection change haptic
   */
  public selectionChange(): void {
    this.impact('selection');
  }

  /**
   * Long press haptic
   */
  public longPress(): void {
    this.impact('heavy');
  }

  /**
   * Swipe haptic
   */
  public swipe(): void {
    this.impact('medium');
  }

  /**
   * Premium action haptic (for ULTRA+ features)
   */
  public premiumAction(): void {
    if (!this.isSupported) return;
    
    try {
      if (navigator.vibrate && typeof navigator.vibrate === 'function') {
        navigator.vibrate([5, 10, 5, 10, 15]);
      }
    } catch (error) {
      console.warn('Premium haptic feedback failed:', error);
    }
  }

  /**
   * Match found haptic (for video chat connections)
   */
  public matchFound(): void {
    if (!this.isSupported) return;
    
    try {
      if (navigator.vibrate && typeof navigator.vibrate === 'function') {
        navigator.vibrate([20, 30, 20, 30, 50]);
      }
    } catch (error) {
      console.warn('Match found haptic feedback failed:', error);
    }
  }

  /**
   * Check if haptics are supported
   */
  public isHapticsSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Disable haptics (for user preference)
   */
  public disable(): void {
    this.isSupported = false;
  }

  /**
   * Enable haptics (for user preference)
   */
  public enable(): void {
    this.isSupported = this.checkSupport();
  }
}

// Export singleton instance
export const haptics = new HapticsService();

// Export React hook for haptics
export function useHaptics() {
  return {
    impact: (type?: HapticType) => haptics.impact(type),
    success: () => haptics.success(),
    error: () => haptics.error(),
    buttonTap: () => haptics.buttonTap(),
    selectionChange: () => haptics.selectionChange(),
    longPress: () => haptics.longPress(),
    swipe: () => haptics.swipe(),
    premiumAction: () => haptics.premiumAction(),
    matchFound: () => haptics.matchFound(),
    isSupported: () => haptics.isHapticsSupported(),
    disable: () => haptics.disable(),
    enable: () => haptics.enable(),
  };
}

// Default export
export default haptics;
