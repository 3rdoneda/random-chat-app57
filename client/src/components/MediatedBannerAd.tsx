import { useEffect, useRef, useState } from 'react';
import { adMobService } from '../lib/adMobMediationService';
import { usePremium } from '../context/PremiumProvider';

interface MediatedBannerAdProps {
  size?: 'banner' | 'leaderboard' | 'rectangle';
  position?: 'top' | 'bottom' | 'inline';
  className?: string;
  style?: React.CSSProperties;
}

export default function MediatedBannerAd({ 
  size = 'banner', 
  position = 'inline',
  className = '',
  style = {}
}: MediatedBannerAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [loadingNetwork, setLoadingNetwork] = useState<string>('');

  useEffect(() => {
    const loadAd = async () => {
      if (!adRef.current) return;

      const containerId = `mediated-banner-${Math.random().toString(36).substr(2, 9)}`;
      adRef.current.id = containerId;

      try {
        setLoadingNetwork('Optimizing...');
        const success = await adMobService.loadMediatedBannerAd(containerId, size);
        
        if (success) {
          setAdLoaded(true);
          setLoadingNetwork('');
        } else {
          setAdError(true);
          setLoadingNetwork('');
        }
      } catch (error) {
        console.error('Mediated banner ad failed:', error);
        setAdError(true);
        setLoadingNetwork('');
      }
    };

    // Initialize AdMob service first
    adMobService.initialize().then(() => {
      loadAd();
    }).catch(() => {
      setAdError(true);
    });
  }, [size]);

  const getSizeStyles = () => {
    switch (size) {
      case 'leaderboard':
        return { minHeight: '90px', maxWidth: '728px' };
      case 'rectangle':
        return { minHeight: '250px', maxWidth: '300px' };
      default:
        return { minHeight: '50px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    width: '100%',
    textAlign: 'center',
    margin: '10px 0',
    ...getSizeStyles(),
    ...style
  };

  return (
    <div className={`mediated-banner-ad ${className}`} style={baseStyles}>
      <div ref={adRef} style={{ width: '100%', height: '100%' }}>
        {/* Loading state */}
        {loadingNetwork && (
          <div style={{
            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: getSizeStyles().minHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div>
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>💰 AdMob Mediation</p>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                {loadingNetwork}
              </p>
            </div>
          </div>
        )}

        {/* Error/fallback state */}
        {(adError || import.meta.env.DEV) && !loadingNetwork && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: getSizeStyles().minHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>📱 AdMob Mediation</p>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.8 }}>
                {adError ? 'Optimizing ad delivery...' : 'Demo ad content'}
              </p>
              <p style={{ margin: 0, fontSize: '10px', opacity: 0.6 }}>
                Revenue maximized via mediation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
