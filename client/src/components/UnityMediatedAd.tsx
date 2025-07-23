import React, { useEffect, useState } from 'react';
import { adMobService } from '../lib/adMobMediationService';
import { unityAdsService } from '../lib/unityAdsService';

interface UnityMediatedAdProps {
  type: 'banner' | 'interstitial' | 'rewarded';
  containerId?: string;
  onAdLoaded?: () => void;
  onAdFailed?: (error: string) => void;
  onAdClicked?: () => void;
  onRewardEarned?: (amount: number) => void;
  className?: string;
  children?: React.ReactNode;
}

const UnityMediatedAd: React.FC<UnityMediatedAdProps> = ({
  type,
  containerId = `unity-ad-${type}-${Date.now()}`,
  onAdLoaded,
  onAdFailed,
  onAdClicked,
  onRewardEarned,
  className = '',
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdReadiness();
  }, [type]);

  const checkAdReadiness = () => {
    const ready = unityAdsService.isReady(type as 'banner' | 'interstitial' | 'rewarded');
    setIsReady(ready);
    
    if (ready && onAdLoaded) {
      onAdLoaded();
    }
  };

  const handleShowAd = async () => {
    if (!isReady) {
      const errorMsg = 'Unity ad not ready';
      setError(errorMsg);
      onAdFailed?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      switch (type) {
        case 'banner':
          const bannerSuccess = await unityAdsService.loadBannerAd(containerId, {
            placementId: 'banner',
            type: 'banner'
          });
          
          if (bannerSuccess) {
            onAdLoaded?.();
          } else {
            throw new Error('Banner ad failed to load');
          }
          break;

        case 'interstitial':
          const interstitialSuccess = await unityAdsService.showInterstitialAd();
          
          if (interstitialSuccess) {
            onAdClicked?.();
          } else {
            throw new Error('Interstitial ad failed to show');
          }
          break;

        case 'rewarded':
          const rewardedResult = await unityAdsService.showRewardedAd();
          
          if (rewardedResult.success) {
            onRewardEarned?.(rewardedResult.rewardAmount);
            onAdClicked?.();
          } else {
            throw new Error(rewardedResult.error || 'Rewarded ad failed');
          }
          break;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ad failed';
      setError(errorMsg);
      onAdFailed?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBannerContainer = () => (
    <div 
      id={containerId}
      className={`unity-banner-container ${className}`}
      style={{
        minHeight: '90px',
        width: '100%',
        position: 'relative'
      }}
    >
      {!isReady && (
        <div className="flex items-center justify-center h-full bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium">🎮 Unity Ads</div>
            <div className="text-xs opacity-75">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderActionButton = () => (
    <button
      onClick={handleShowAd}
      disabled={!isReady || isLoading}
      className={`
        inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${!isReady || isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 hover:shadow-lg'
        }
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>🎮</span>
          <span>
            {type === 'rewarded' && 'Watch Unity Ad'}
            {type === 'interstitial' && 'Show Unity Ad'}
            {type === 'banner' && 'Load Unity Ad'}
          </span>
        </div>
      )}
    </button>
  );

  const renderStatusIndicator = () => (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
      ${isReady 
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-orange-100 text-orange-800 border border-orange-200'
      }
    `}>
      <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-orange-500'}`}></div>
      <span>Unity Ads {isReady ? 'Ready' : 'Loading'}</span>
    </div>
  );

  if (type === 'banner') {
    return (
      <div className="unity-mediated-ad-wrapper">
        {renderBannerContainer()}
        {error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            ⚠️ {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="unity-mediated-ad-wrapper">
      {children ? (
        <div onClick={handleShowAd} className="cursor-pointer">
          {children}
        </div>
      ) : (
        renderActionButton()
      )}
      
      {/* Status indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2">
          {renderStatusIndicator()}
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default UnityMediatedAd;

// Export specific Unity ad components for easy use
export const UnityBannerAd: React.FC<Omit<UnityMediatedAdProps, 'type'>> = (props) => (
  <UnityMediatedAd type="banner" {...props} />
);

export const UnityInterstitialButton: React.FC<Omit<UnityMediatedAdProps, 'type'>> = (props) => (
  <UnityMediatedAd type="interstitial" {...props} />
);

export const UnityRewardedAdButton: React.FC<Omit<UnityMediatedAdProps, 'type'>> = (props) => (
  <UnityMediatedAd type="rewarded" {...props} />
);
