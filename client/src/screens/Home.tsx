import { useCallback, useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { playSound } from "../lib/audio";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInAppNotification } from "../components/InAppNotification";
import { useDailyBonusNotification } from "../hooks/useDailyBonusNotification";
import {
  Crown,
  Coins,
  Mic,
  Video,
  Users,
  Sparkles,
  Heart,
  Zap,
  Shield,
  Star,
  Play,
  Globe,
  User,
  Gem,
} from "lucide-react";
import GenderFilter from "../components/GenderFilter";
// import PremiumPaywall from "../components/PremiumPaywall"; // Now using separate page
import TreasureChest from "../components/TreasureChest";
import BottomNavBar from "../components/BottomNavBar";
import { usePremium } from "../context/PremiumProvider";
import { useCoin } from "../context/CoinProvider";
import { useLanguage } from "../context/LanguageProvider";
import BannerAd from "../components/BannerAd";
import RewardedAdButton from "../components/RewardedAdButton";
import PremiumBadge from "../components/PremiumBadge";
import { OnlineNotificationManager } from "../components/OnlineNotification";
import UltraHomeEnhancements from "../components/UltraHomeEnhancements";
import UltraBottomNavBar from "../components/UltraBottomNavBar";
import { UltraPageTransition } from "../components/UltraBottomNavBar";

// Ad unit IDs for scrollable banner ads
const adUnitIds = [
  import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-1776596266948987/2770517385', // Original banner ad
  'ca-app-pub-1776596266948987/7315217300', // New ad unit 1
  'ca-app-pub-1776596266948987/2468099206', // New ad unit 2
];

const testimonials = [
  {
    name: "Priya",
    text: "Found my perfect match here! So grateful 💕",
    rating: 5,
  },
  {
    name: "Arjun",
    text: "Every chat is a new adventure, truly amazing!",
    rating: 5,
  },
  {
    name: "Sneha",
    text: "Safe, fun, and full of romantic possibilities 🌟",
    rating: 5,
  },
];

const stats = [
  { number: "10M+", label: "Happy Users", icon: Users },
  { number: "50M+", label: "Connections Made", icon: Heart },
  { number: "99.9%", label: "Uptime", icon: Shield },
];

export default function Home() {
  const { socket, isUsingMockMode } = useSocket();
  const navigate = useNavigate();
  const { isPremium, setPremium, isUltraPremium, isProMonthly, premiumPlan } = usePremium();
  const {
    coins,
    claimDailyBonus,
    canClaimDailyBonus,
    isLoading: coinsLoading,
    currentUser,
    hasCompletedOnboarding,
  } = useCoin();
  const { t } = useLanguage();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  // const [showPaywall, setShowPaywall] = useState(false); // Now using separate page
  const [showTreasureChest, setShowTreasureChest] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(12847);
  const { showBonusNotification, NotificationComponent } =
    useInAppNotification();

  // Handle daily bonus notification
  useDailyBonusNotification({
    canClaimDailyBonus,
    currentUser,
    hasCompletedOnboarding,
    showBonusNotification,
    claimDailyBonus,
  });

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (currentUser && !coinsLoading && !hasCompletedOnboarding) {
      navigate('/onboarding');
    }
  }, [currentUser, hasCompletedOnboarding, coinsLoading, navigate]);

  // Simulate online users count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adUnitIds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCall = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (isConnecting) return;

      setIsConnecting(true);
      playSound("join");

      // Navigate immediately to video chat page (it will handle the waiting state)
      navigate("/video-chat", {
        state: {
          isSearching: true,
        },
      });

      setIsConnecting(false);
    },
    [navigate, isConnecting],
  );

  const handleVoiceChat = useCallback(() => {
    navigate("/voice");
  }, [navigate]);

  const handleUpgrade = () => {
    navigate("/premium");
  };

  // const handlePremiumPurchase = (plan: string) => {
  //   const now = new Date();
  //   const expiry = new Date(now);
  //   if (plan === "weekly") {
  //     expiry.setDate(now.getDate() + 7);
  //   } else {
  //     expiry.setMonth(now.getMonth() + 1);
  //   }

  //   setPremium(true, expiry);
  //   setShowPaywall(false);

  //   showBonusNotification(
  //     "🎉 Welcome to Premium!",
  //     `Your ${plan} subscription is now active! Enjoy unlimited features.`,
  //     () => {},
  //   );
  // }; // Now handled in PremiumPage

  // Show loading while checking authentication and onboarding status
  if (coinsLoading && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-peach-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {t("app.name")} - Random Video Chat - Live chat with ajnabis
        </title>
      </Helmet>
      <UltraPageTransition>
        <main className={`flex flex-col min-h-screen w-full ${
          isUltraPremium() 
            ? 'max-w-full' 
            : 'max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl'
        } mx-auto ${
          isUltraPremium() 
            ? 'bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90' 
            : 'bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50'
        } relative pb-16 sm:pb-20 lg:pb-24 overflow-hidden`}>
        {/* Enhanced Animated Background Elements with Indian flair */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-6 sm:top-10 left-6 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-sindoor-300 to-henna-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-20 sm:top-32 right-4 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-royal-300 to-gulmohar-400 rounded-full opacity-30 animate-bounce"></div>
          <div
            className="absolute bottom-32 sm:bottom-40 left-4 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-jasmine-300 to-sindoor-400 rounded-full opacity-25 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-48 sm:bottom-60 right-8 sm:right-12 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-passion-400 to-royal-400 rounded-full opacity-20 animate-bounce"
            style={{ animationDelay: "2s" }}
          ></div>
          {/* Add romantic Indian symbols */}
          <div
            className="absolute top-16 sm:top-20 right-16 sm:right-20 text-sindoor-400 text-lg sm:text-xl lg:text-2xl opacity-40 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          >
            💕
          </div>
          <div
            className="absolute bottom-64 sm:bottom-80 left-12 sm:left-16 text-henna-400 text-base sm:text-lg lg:text-xl opacity-35 animate-bounce"
            style={{ animationDelay: "1.5s" }}
          >
            🌸
          </div>
          <div
            className="absolute top-48 sm:top-60 left-6 sm:left-8 text-jasmine-400 text-sm sm:text-base lg:text-lg opacity-30 animate-pulse"
            style={{ animationDelay: "2.5s" }}
          >
            ✨
          </div>
          <div
            className="absolute top-64 sm:top-80 right-4 sm:right-6 text-gulmohar-400 text-xs sm:text-sm lg:text-base opacity-25 animate-bounce"
            style={{ animationDelay: "3s" }}
          >
            🪷
          </div>
        </div>

        {/* Enhanced Two-Row Header Design */}
        <header className={`w-full ${
          isUltraPremium() 
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700' 
            : 'bg-gradient-to-r from-peach-400 via-coral-400 to-blush-500'
        } shadow-lg px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b ${
          isUltraPremium() ? 'border-purple-300' : 'border-peach-200'
        } relative overflow-hidden`}>
          {/* Header Background Pattern with Indian touch */}
          <div className={`absolute inset-0 ${
            isUltraPremium() 
              ? 'bg-gradient-to-r from-white/20 via-purple-100/30 to-white/20' 
              : 'bg-gradient-to-r from-white/15 via-jasmine-100/25 to-white/15'
          } backdrop-blur-sm`}></div>
          <div className={`absolute top-0 left-0 w-full h-full ${
            isUltraPremium() 
              ? 'bg-gradient-to-r from-transparent via-pink-200/20 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-henna-200/15 to-transparent'
          }`}></div>

          <div className="relative z-10 space-y-4">
            {/* Top Row: Logo + Settings & Coins */}
            <div className="flex items-center justify-between">
              {/* Left: AjnabiCam Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  {isUltraPremium() ? <Gem className="h-5 w-5 text-white" /> : <Heart className="h-5 w-5 text-white" />}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-lg">
                      {isUltraPremium() ? "AjnabiCam ULTRA+" : t("app.name")}
                    </h1>
                    {isUltraPremium() && (
                      <div className="flex items-center gap-1">
                        <PremiumBadge plan="ultra-quarterly" size="sm" />
                        <div className="text-yellow-300 animate-pulse">✨</div>
                      </div>
                    )}
                    {isProMonthly() && (
                      <PremiumBadge plan="pro-monthly" size="sm" />
                    )}
                    {isPremium && !isUltraPremium() && !isProMonthly() && (
                      <PremiumBadge plan="weekly" size="sm" />
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Settings & Coins */}
              <div className="flex items-center gap-3">
                {/* Settings Button */}
                <Button
                  onClick={() => navigate("/profile")}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold p-2.5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/30"
                >
                  <User className="h-5 w-5" />
                </Button>

                {/* Coins Button */}
                <Button
                  onClick={() => setShowTreasureChest(true)}
                  disabled={coinsLoading}
                  className="bg-gradient-to-r from-jasmine-500 to-gulmohar-600 hover:from-jasmine-600 hover:to-gulmohar-700 text-white font-bold px-4 py-2.5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  {coinsLoading ? "..." : coins}
                </Button>
              </div>
            </div>

            {/* Bottom Row: Premium Badge + Voice Match Toggle */}
            <div className="flex items-center justify-between">
              {/* Left: Premium Badge */}
              <div className="flex items-center gap-3">
                {isPremium ? (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-jasmine-400 to-gulmohar-500 px-3 py-1 rounded-full shadow-md">
                    <Crown className="h-3 w-3 text-white" />
                    <span className="text-white text-xs font-bold">
                      PREMIUM
                    </span>
                  </div>
                ) : (
                  <div className="text-white/80 text-xs font-medium">
                    ✨ Upgrade for premium features
                  </div>
                )}
              </div>

              {/* Right: Voice Match Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleVoiceChat}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold px-3 py-1.5 rounded-full shadow-md transform hover:scale-105 transition-all duration-200 border border-white/30 text-xs"
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Voice Match
                </Button>
              </div>
            </div>
          </div>
                </header>

        {/* Scrollable Banner Ads - Only for non-ULTRA+ users */}
        {!isUltraPremium() && (
          <div className="w-full relative bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `translateX(-${currentAdIndex * 100}%)`,
                }}
              >
                {adUnitIds.map((adUnitId, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="h-24 sm:h-32 lg:h-40 w-full">
                      <BannerAd
                        size="responsive"
                        position="top"
                        className="h-full w-full"
                        style={{ minHeight: '96px' }}
                        key={`ad-${adUnitId}-${index}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        )}

        <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          {/* Enhanced Gender Filter - Moved to top */}
          <div className="w-full mb-4 sm:mb-6">
            <GenderFilter
              isPremium={isPremium}
              onGenderSelect={(gender: string) => {
                console.log("Selected gender:", gender);
              }}
              onUpgrade={handleUpgrade}
            />
          </div>

          {/* Enhanced Main Action Button - Moved to top */}
          <div className="w-full mb-4 sm:mb-6">
            <Button
              className={`w-full py-4 sm:py-6 lg:py-8 text-lg sm:text-xl lg:text-2xl font-bold rounded-2xl sm:rounded-3xl text-white shadow-2xl transform transition-all duration-300 relative overflow-hidden ${
                isConnecting
                  ? "bg-gradient-to-r from-coral-400 to-blush-500 scale-95"
                  : "bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 hover:scale-105 hover:shadow-3xl"
              }`}
              onClick={handleStartCall}
              disabled={isConnecting}
            >
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-jasmine-200/40 via-white/25 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Finding your match...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>{t("home.start")}</span>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  </>
                )}
              </div>
            </Button>
          </div>

                    {/* Quick Actions */}
          <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Button
              onClick={() => navigate("/friends")}
              className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-blue-500" />
              <span className="font-semibold">Friends</span>
            </Button>

            <Button
              onClick={() => navigate("/ai-chatbot")}
              className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base"
            >
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-purple-500" />
              <span className="font-semibold">AI Chat</span>
            </Button>
          </div>

          {/* Rewarded Ad Section - Only for non-premium users */}
          {!isPremium && (
            <div className="w-full mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-purple-800 mb-1">
                      💰 Earn Free Coins!
                    </h3>
                    <p className="text-xs text-purple-600">
                      Watch a short ad to earn 10 coins
                    </p>
                  </div>
                  <RewardedAdButton
                    variant="compact"
                    onRewardEarned={(amount) => {
                      console.log(`User earned ${amount} coins from ad`);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Text */}
          <div className="text-xs sm:text-sm text-center text-gray-500 px-2 sm:px-4 leading-relaxed">
            By using AjnabiCam, you agree to our Terms of Service and Privacy
            Policy.
            <br className="hidden sm:block" />
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-1 sm:mt-0">
              <span className="text-rose-600 font-medium">✓ Safe & Secure</span>
              <span className="text-gray-400">•</span>
              <span className="text-pink-600 font-medium">24/7 Support</span>
              <span className="text-gray-400">•</span>
              <span className="text-crimson-600 font-medium">
                Find True Love
              </span>
            </div>
          </div>
        </div>

        {/* Floating Coin Store Button with Indian colors */}
        <button
          onClick={() => setShowTreasureChest(true)}
          className="fixed bottom-20 sm:bottom-24 lg:bottom-28 right-3 sm:right-4 lg:right-6 bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-40 animate-pulse"
        >
          <div className="relative">
            <Coins className="h-5 w-5 sm:h-6 sm:w-6" />
            {coins > 0 && (
              <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-sindoor-500 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-md">
                {coins > 99 ? "99+" : coins}
              </div>
            )}
          </div>
        </button>

        {/* Debug: Test ULTRA+ Features */}
        {!isUltraPremium() && (
          <div className="px-4 mb-4">
            <Button
              onClick={() => {
                const expiry = new Date();
                expiry.setMonth(expiry.getMonth() + 3);
                setPremium(true, expiry, 'ultra-quarterly');
                alert('🎉 ULTRA+ activated! Experience the luxury!');
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg shadow-md transition-colors text-center"
            >
              <Crown className="h-4 w-4 mr-2" />
              🧪 Try ULTRA+ Experience (Test Mode)
            </Button>
          </div>
        )}

        {/* ULTRA+ Home Enhancements */}
        {isUltraPremium() && (
          <div className="px-4 mb-6">
            <UltraHomeEnhancements
              isUltraPremium={true}
              onQuickMatch={() => {
                setIsConnecting(true);
                navigate("/video-chat", {
                  state: { genderFilter: "all", voiceOnly: false, isSearching: true }
                });
              }}
              onPremiumSearch={() => {
                // Premium search with VIP matching
                setIsConnecting(true);
                navigate("/video-chat", {
                  state: { genderFilter: "premium", voiceOnly: false, isSearching: true }
                });
              }}
              onAnalytics={() => {
                // Open premium analytics dashboard
                console.log("Opening ULTRA+ Analytics Dashboard");
              }}
            />
          </div>
        )}

        {/* Use UltraBottomNavBar for ULTRA+ users, regular for others */}
        {isUltraPremium() ? <UltraBottomNavBar /> : <BottomNavBar />}
        </main>
      </UltraPageTransition>

      {/* PremiumPaywall now moved to separate /premium page */}

      {/* Online Notifications for Premium Users */}
      {(isUltraPremium() || isProMonthly()) && <OnlineNotificationManager />}

      <TreasureChest
        isOpen={showTreasureChest}
        onClose={() => setShowTreasureChest(false)}
      />

      <NotificationComponent />
    </>
  );
}
