import { useEffect, useRef, useState } from 'react';
import { adService } from '../lib/adService';
import { usePremium } from '../context/PremiumProvider';

interface BannerAdProps {
  size?: 'small' | 'medium' | 'large' | 'responsive';
  position?: 'top' | 'bottom' | 'inline';
  adUnitId?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AD_SIZES = {
  small: { width: 320, height: 50 },    // Mobile banner
  medium: { width: 728, height: 90 },   // Leaderboard
  large: { width: 970, height: 250 },   // Large banner
  responsive: undefined                  // Auto-size
};

export default function BannerAd({ 
  size = 'responsive', 
  position = 'inline',
  adUnitId,
  className = '',
  style = {}
}: BannerAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    const loadAd = async () => {
      if (!adRef.current) return;

      const containerId = `banner-ad-${Math.random().toString(36).substr(2, 9)}`;
      adRef.current.id = containerId;

      try {
        const placement = {
          id: containerId,
          type: 'banner' as const,
          position,
          size: AD_SIZES[size]
        };

        const success = await adService.loadBannerAd(containerId, placement, adUnitId);
        
        if (success) {
          setAdLoaded(true);
          adService.trackAdEvent('shown', 'banner');
        } else {
          setAdError(true);
        }
      } catch (error) {
        console.error('Banner ad failed to load:', error);
        setAdError(true);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [size, position]);

  // Don't render if ad failed and we're not in development
  if (adError && !import.meta.env.DEV) {
    return null;
  }

  const baseStyles: React.CSSProperties = {
    width: '100%',
    textAlign: 'center',
    margin: '10px 0',
    ...style
  };

  // Add size-specific styles
  if (AD_SIZES[size]) {
    const adSize = AD_SIZES[size]!;
    baseStyles.minHeight = `${adSize.height}px`;
    baseStyles.maxWidth = `${adSize.width}px`;
    baseStyles.margin = '10px auto';
  }

  return (
    <div className={`banner-ad ${className}`} style={baseStyles}>
      <div ref={adRef} style={{ width: '100%', height: '100%' }}>
        {/* Fallback content for development or when ads fail */}
        {(adError || import.meta.env.DEV) && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: AD_SIZES[size]?.height || '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>📱 Advertisement</p>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                {adError ? 'Ad failed to load' : 'Sample ad content'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
