import { useState } from 'react';
import { Button } from './ui/button';
import { Play, Coins, Gift, Gamepad2 } from 'lucide-react';
import { adService } from '../lib/adService';
import { adMobService } from '../lib/adMobMediationService';
import { unityAdsService } from '../lib/unityAdsService';
import { useCoin } from '../context/CoinProvider';
import { usePremium } from '../context/PremiumProvider';

interface RewardedAdButtonProps {
  onRewardEarned?: (amount: number) => void;
  disabled?: boolean;
  variant?: 'default' | 'premium' | 'compact';
  className?: string;
  preferUnity?: boolean; // Prefer Unity Ads for higher eCPM
}

export default function RewardedAdButton({
  onRewardEarned,
  disabled = false,
  variant = 'default',
  className = '',
  preferUnity = true
}: RewardedAdButtonProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [adNetwork, setAdNetwork] = useState<string>('checking...');
  const { addCoins } = useCoin();

  const handleWatchAd = async () => {
    if (isWatching || disabled) return;

    setIsWatching(true);
    setAdNetwork('loading...');

    try {
      let result;
      let networkUsed = 'Unknown';

      // Try Unity Ads first if preferred and available
      if (preferUnity && unityAdsService.isReady('rewarded')) {
        console.log('🎮 Trying Unity Ads first...');
        setAdNetwork('Unity Ads');
        result = await unityAdsService.showRewardedAd();
        networkUsed = 'Unity Ads';

        if (!result.success) {
          console.log('🔄 Unity failed, trying mediation fallback...');
          setAdNetwork('AdMob Mediation');
          result = await adMobService.showMediatedRewardedAd();
          networkUsed = result.network || 'AdMob';
        }
      } else {
        // Use AdMob mediation (includes Unity + other networks)
        console.log('📱 Using AdMob mediation...');
        setAdNetwork('AdMob Mediation');
        result = await adMobService.showMediatedRewardedAd();
        networkUsed = result.network || 'AdMob';

        // Fallback to basic ad service if mediation fails
        if (!result.success) {
          console.log('🔄 Mediation failed, trying basic ad service...');
          setAdNetwork('AdSense');
          const basicResult = await adService.showRewardedAd();
          result = {
            success: basicResult.success,
            reward: basicResult.rewardAmount,
            network: 'AdSense'
          };
          networkUsed = 'AdSense';
        }
      }

      if (result.success) {
        const rewardAmount = (result as any).reward || (result as any).rewardAmount || 10;

        // Add coins to user's balance
        await addCoins(rewardAmount);

        // Track the event with network info
        adService.trackAdEvent('rewarded', `${networkUsed.toLowerCase()}_video`);

        // Notify parent component
        onRewardEarned?.(rewardAmount);

        // Show success message with network info
        const networkEmoji = networkUsed === 'Unity Ads' ? '🎮' :
                           networkUsed.includes('Facebook') ? '📘' :
                           networkUsed.includes('AppLovin') ? '🔷' : '📱';

        alert(`🎉 You earned ${rewardAmount} coins from ${networkEmoji} ${networkUsed}!`);
        setAdNetwork('completed');
      } else {
        alert(`❌ Could not complete ad: ${(result as any).error || 'Unknown error'}`);
        setAdNetwork('failed');
      }
    } catch (error) {
      console.error('Rewarded ad error:', error);
      alert('❌ Failed to load ad. Please try again later.');
      setAdNetwork('error');
    } finally {
      setIsWatching(false);
    }
  };

  const buttonProps = {
    onClick: handleWatchAd,
    disabled: disabled || isWatching,
    className: `rewarded-ad-button ${className}`
  };

  if (variant === 'compact') {
    return (
      <Button
        {...buttonProps}
        size="sm"
        className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white ${className}`}
      >
        {isWatching ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            {adNetwork}
          </>
        ) : (
          <>
            {preferUnity && unityAdsService.isReady('rewarded') ? (
              <Gamepad2 className="w-4 h-4 mr-1" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            +{preferUnity ? '15' : '10'}
          </>
        )}
      </Button>
    );
  }

  if (variant === 'premium') {
    const isUnityReady = preferUnity && unityAdsService.isReady('rewarded');
    const expectedReward = isUnityReady ? 15 : 10;

    return (
      <Button
        {...buttonProps}
        className={`${
          isUnityReady
            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 hover:from-orange-600 hover:via-red-600 hover:to-purple-600'
            : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600'
        } text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 ${className}`}
      >
        {isWatching ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
            <div className="text-left">
              <div className="text-lg">Watching...</div>
              <div className="text-sm opacity-90">{adNetwork}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            {isUnityReady ? (
              <Gamepad2 className="w-5 h-5 mr-3" />
            ) : (
              <Gift className="w-5 h-5 mr-3" />
            )}
            <div className="text-left">
              <div className="text-lg">
                {isUnityReady ? 'Unity Ad' : 'Watch Ad'}
              </div>
              <div className="text-sm opacity-90">
                Earn {expectedReward} Coins
                {isUnityReady && <span className="ml-1">🎮</span>}
              </div>
            </div>
          </div>
        )}
      </Button>
    );
  }

  // Default variant
  const isUnityReady = preferUnity && unityAdsService.isReady('rewarded');
  const expectedReward = isUnityReady ? 15 : 10;

  return (
    <Button
      {...buttonProps}
      className={`${
        isUnityReady
          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
      } text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ${className}`}
    >
      {isWatching ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          {adNetwork}
        </>
      ) : (
        <>
          {isUnityReady ? (
            <Gamepad2 className="w-4 h-4 mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Watch Ad for {expectedReward} Coins
          <Coins className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}
