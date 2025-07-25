import { useState } from 'react';
import { Button } from './ui/button';
import { Play, Coins, Gift, TrendingUp } from 'lucide-react';
import { adMobService } from '../lib/adMobMediationService';
import { useCoin } from '../context/CoinProvider';
import { usePremium } from '../context/PremiumProvider';

interface MediatedRewardedAdButtonProps {
  onRewardEarned?: (amount: number, network: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'premium' | 'compact';
  className?: string;
}

export default function MediatedRewardedAdButton({ 
  onRewardEarned,
  disabled = false,
  variant = 'default',
  className = ''
}: MediatedRewardedAdButtonProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [lastNetwork, setLastNetwork] = useState<string>('');
  const { addCoins } = useCoin();
  const { isUltraPremium, isProMonthly } = usePremium();

  // Hide rewarded ads for premium users
  if (isUltraPremium() || isProMonthly()) {
    return null;
  }

  const handleWatchAd = async () => {
    if (isWatching || disabled) return;

    setIsWatching(true);
    
    try {
      // Initialize AdMob mediation if not already done
      await adMobService.initialize();
      
      const result = await adMobService.showMediatedRewardedAd();
      
      if (result.success) {
        // Add coins to user's balance
        await addCoins(result.reward);
        
        // Update last network used
        setLastNetwork(result.network);
        
        // Notify parent component
        onRewardEarned?.(result.reward, result.network);
        
        // Show success message with network info
        alert(`🎉 Success! Earned ${result.reward} coins via ${result.network}!\n\n💰 AdMob mediation optimized your reward!`);
      } else {
        alert(`❌ Could not load ad. Our mediation system is optimizing for next time!`);
      }
    } catch (error) {
      console.error('Mediated rewarded ad error:', error);
      alert('❌ Failed to load ad. Please try again later.');
    } finally {
      setIsWatching(false);
    }
  };

  const buttonProps = {
    onClick: handleWatchAd,
    disabled: disabled || isWatching,
    className: `mediated-rewarded-ad-button ${className}`
  };

  if (variant === 'compact') {
    return (
      <Button
        {...buttonProps}
        size="sm"
        className={`bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:from-blue-600 hover:via-purple-600 hover:to-green-600 text-white ${className}`}
      >
        {isWatching ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Loading...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-1" />
            <TrendingUp className="w-3 h-3 mr-1" />
            +10-15
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
            <span>Loading Best Ad...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <Gift className="w-5 h-5 mr-1" />
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-lg">Watch Mediated Ad</div>
              <div className="text-sm opacity-90">
                Earn 10-15 Coins {lastNetwork && `(${lastNetwork})`}
              </div>
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
      className={`bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:from-blue-600 hover:via-purple-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ${className}`}
    >
      {isWatching ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Optimizing...
        </>
      ) : (
        <>
          <Play className="w-4 h-4 mr-2" />
          <TrendingUp className="w-4 h-4 mr-1" />
          Watch Ad for 10-15 Coins
          <Coins className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}
