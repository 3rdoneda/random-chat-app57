import { useState } from 'react';
import { Button } from './ui/button';
import { Play, Coins, Gift, Gamepad2 } from 'lucide-react';
import { adService } from '../lib/adService';
import { adMobService } from '../lib/adMobMediationService';
import { unityAdsService } from '../lib/unityAdsService';
import { useCoin } from '../context/CoinProvider';

interface RewardedAdButtonProps {
  onRewardEarned?: (amount: number) => void;
  disabled?: boolean;
  variant?: 'default' | 'premium' | 'compact';
  className?: string;
}

export default function RewardedAdButton({ 
  onRewardEarned,
  disabled = false,
  variant = 'default',
  className = ''
}: RewardedAdButtonProps) {
  const [isWatching, setIsWatching] = useState(false);
  const { addCoins } = useCoin();

  const handleWatchAd = async () => {
    if (isWatching || disabled) return;

    setIsWatching(true);
    
    try {
      const result = await adService.showRewardedAd();
      
      if (result.success) {
        // Add coins to user's balance
        await addCoins(result.rewardAmount);
        
        // Track the event
        adService.trackAdEvent('rewarded', 'video');
        
        // Notify parent component
        onRewardEarned?.(result.rewardAmount);
        
        // Show success message
        alert(`🎉 You earned ${result.rewardAmount} coins! Keep watching ads to earn more.`);
      } else {
        alert(`❌ Could not complete ad: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Rewarded ad error:', error);
      alert('❌ Failed to load ad. Please try again later.');
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
            Watching...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-1" />
            +10
          </>
        )}
      </Button>
    );
  }

  if (variant === 'premium') {
    return (
      <Button
        {...buttonProps}
        className={`bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 ${className}`}
      >
        {isWatching ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
            <span>Watching Ad...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <Gift className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="text-lg">Watch Ad</div>
              <div className="text-sm opacity-90">Earn 10 Coins</div>
            </div>
          </div>
        )}
      </Button>
    );
  }

  // Default variant
  return (
    <Button
      {...buttonProps}
      className={`bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ${className}`}
    >
      {isWatching ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Watching...
        </>
      ) : (
        <>
          <Play className="w-4 h-4 mr-2" />
          Watch Ad for 10 Coins
          <Coins className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}
