import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BottomNavBar from "../components/BottomNavBar";
import UltraBottomNavBar from "../components/UltraBottomNavBar";
import UltraProfileEnhancements from "../components/UltraProfileEnhancements";
import { UltraPageTransition } from "../components/UltraBottomNavBar";
import { usePremium } from "../context/PremiumProvider";
import { useCoin } from "../context/CoinProvider";
import { useLanguage } from "../context/LanguageProvider";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import SettingsModal from "../components/SettingsModal";
import LanguageSelector from "../components/LanguageSelector";
import HelpSupportModal from "../components/HelpSupportModal";
import {
  ArrowLeft,
  Camera,
  Crown,
  Coins,
  Settings,
  Globe,
  HelpCircle,
  Share,
  Copy,
  Database,
  Shield,
  Bell,
  User,
  Edit3,
  Star,
  Heart,
  Users,
  Zap,
  Gift,
  TrendingUp,
  Award,
  Target,
  Eye,
  MessageCircle,
  Video,
  Clock,
  Sparkles,
  Gem,
} from "lucide-react";
import { uploadProfileImage, getStorageErrorMessage } from "../lib/storageUtils";
import { getUserId } from "../lib/userUtils";
import PremiumBadge from "../components/PremiumBadge";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, isUltraPremium, isProMonthly, premiumPlan } = usePremium();
  const { coins } = useCoin();
  const { t } = useLanguage();
  const [profileImage, setProfileImage] = useState<string>("");
  const [username, setUsername] = useState<string>("User");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingType, setSettingType] = useState<'privacy' | 'notifications' | 'account' | 'general' | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced user stats for ULTRA+ users
  const [userStats, setUserStats] = useState({
    totalChats: 0,
    totalFriends: 0,
    premiumSince: new Date(),
    totalReactions: 0,
    avgChatDuration: 0,
    favoriteFeatures: ['Face Filters', 'Premium Reactions', 'Unlimited Time']
  });

  useEffect(() => {
    // Load user data from localStorage
    const savedUsername = localStorage.getItem("ajnabicam_username");
    const savedProfileImage = localStorage.getItem("ajnabicam_profile_image");
    const savedReferralCode = localStorage.getItem("ajnabicam_referral_code");

    if (savedUsername) setUsername(savedUsername);
    if (savedProfileImage) setProfileImage(savedProfileImage);
    if (savedReferralCode) {
      setReferralCode(savedReferralCode);
    } else {
      // Generate referral code if not exists
      const newCode = generateReferralCode();
      setReferralCode(newCode);
      localStorage.setItem("ajnabicam_referral_code", newCode);
    }

    // Load user stats for ULTRA+ users
    if (isUltraPremium()) {
      loadUserStats();
    }
  }, [isUltraPremium]);

  const generateReferralCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(Math.random() * 1000);
  };

  const loadUserStats = () => {
    // In a real app, this would load from Firestore
    setUserStats({
      totalChats: Math.floor(Math.random() * 100) + 50,
      totalFriends: Math.floor(Math.random() * 30) + 10,
      premiumSince: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within 90 days
      totalReactions: Math.floor(Math.random() * 200) + 50,
      avgChatDuration: Math.floor(Math.random() * 20) + 5,
      favoriteFeatures: ['Face Filters', 'Premium Reactions', 'Unlimited Time']
    });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const userId = getUserId();
      const result = await uploadProfileImage(file, userId, (progress) => {
        setUploadProgress(progress);
      });

      setProfileImage(result.url);
      localStorage.setItem("ajnabicam_profile_image", result.url);
      localStorage.setItem("ajnabicam_profile_path", result.path);

      console.log("Profile image uploaded successfully:", result.url);
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      const errorMessage = getStorageErrorMessage(error);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem("ajnabicam_username", newUsername);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      alert("📋 Referral code copied to clipboard!");
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("📋 Referral code copied!");
    });
  };

  const shareReferralCode = () => {
    const shareText = `Join me on AjnabiCam! Use my referral code: ${referralCode} to unlock 24h Premium. https://ajnabicam.com`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join AjnabiCam",
        text: shareText,
        url: "https://ajnabicam.com"
      });
    } else {
      // Fallback to WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    }
  };

  const handleSettingsClick = (type: 'privacy' | 'notifications' | 'account' | 'general') => {
    setSettingType(type);
    setShowSettingsModal(true);
  };

  const handleProfileUpdate = (updates: any) => {
    // Handle profile updates for ULTRA+ users
    console.log('Profile updates:', updates);
    // In a real app, this would update Firestore
  };

  return (
    <>
      <Helmet>
        <title>AjnabiCam - Profile</title>
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
        } px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative pb-20 sm:pb-24 lg:pb-28`}>

          {/* Enhanced Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-6 left-6 w-12 h-12 bg-gradient-to-br from-peach-300 to-coral-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-20 right-4 w-10 h-10 bg-gradient-to-br from-coral-300 to-blush-400 rounded-full opacity-30 animate-bounce"></div>
            <div
              className="absolute bottom-32 left-4 w-8 h-8 bg-gradient-to-br from-blush-300 to-peach-400 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-48 right-8 w-6 h-6 bg-gradient-to-br from-cream-400 to-coral-400 rounded-full opacity-20 animate-bounce"
              style={{ animationDelay: "2s" }}
            ></div>
            {/* Add romantic symbols */}
            <div
              className="absolute top-16 right-16 text-coral-400 text-lg opacity-40 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            >
              💕
            </div>
            <div
              className="absolute bottom-64 left-12 text-peach-400 text-base opacity-35 animate-bounce"
              style={{ animationDelay: "1.5s" }}
            >
              🌸
            </div>
            <div
              className="absolute top-48 left-6 text-blush-400 text-sm opacity-30 animate-pulse"
              style={{ animationDelay: "2.5s" }}
            >
              ✨
            </div>
          </div>

          {/* Header */}
          <div className={`w-full flex items-center p-4 sm:p-5 md:p-6 ${
            isUltraPremium() 
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700' 
              : 'bg-gradient-to-r from-peach-400 via-coral-400 to-blush-500'
          } text-white font-bold text-lg sm:text-xl md:text-2xl rounded-t-3xl sm:rounded-t-2xl shadow-lg relative overflow-hidden`}>
            {/* Header Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-cream-100/25 to-white/15 backdrop-blur-sm"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-peach-200/15 to-transparent"></div>

            <button
              onClick={handleBackClick}
              className="relative z-10 mr-3 sm:mr-4 text-white font-bold text-xl hover:scale-110 transition-transform p-3 sm:p-2 rounded-full hover:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <h1 className="relative z-10 flex-grow text-center drop-shadow-lg font-semibold">{t('profile.title')}</h1>
            <div className="relative z-10 flex items-center gap-2">
              {isPremium && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  isUltraPremium() 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  <Crown className="h-3 w-3 text-white" />
                  <span className="text-white text-xs font-bold">
                    {isUltraPremium() ? 'ULTRA+' : 'PRO'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={`w-full flex flex-col ${
            isUltraPremium() 
              ? 'bg-white/90 backdrop-blur-lg border border-purple-200' 
              : 'bg-white border border-peach-200'
          } rounded-b-3xl sm:rounded-b-2xl shadow-xl mb-4 sm:mb-6 overflow-hidden relative z-10`}>

            {/* Premium Status Section */}
            {isPremium ? (
              <div className={`p-4 sm:p-5 md:p-6 ${
                isUltraPremium() 
                  ? 'bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100' 
                  : 'bg-gradient-to-r from-green-100 via-emerald-100 to-green-100'
              } border-b ${
                isUltraPremium() ? 'border-purple-200' : 'border-green-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${
                    isUltraPremium() 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  } rounded-full flex items-center justify-center shadow-lg`}>
                    {isUltraPremium() ? (
                      <Gem className="h-5 w-5 text-white" />
                    ) : (
                      <Crown className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      isUltraPremium() ? 'text-purple-800' : 'text-green-800'
                    }`}>
                      {t('profile.premium.active')}
                    </h3>
                    <p className={`text-sm ${
                      isUltraPremium() ? 'text-purple-600' : 'text-green-600'
                    }`}>
                      {t('profile.premium.enjoying')}
                    </p>
                  </div>
                  {premiumPlan && (
                    <PremiumBadge 
                      plan={premiumPlan as 'ultra-quarterly' | 'pro-monthly' | 'weekly'} 
                      size="md" 
                    />
                  )}
                </div>
                
                {isUltraPremium() && (
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-700">{userStats.totalChats}</div>
                      <div className="text-xs text-purple-600">Total Chats</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-700">{userStats.totalFriends}</div>
                      <div className="text-xs text-purple-600">Friends</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-700">{userStats.totalReactions}</div>
                      <div className="text-xs text-purple-600">Reactions</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 border-b border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-purple-800">{t('profile.premium.upgrade')}</h3>
                    <p className="text-sm text-purple-600">{t('profile.premium.unlock')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-purple-700">
                  <div>{t('profile.premium.features.gender')}</div>
                  <div>{t('profile.premium.features.voice')}</div>
                  <div>{t('profile.premium.features.unlimited')}</div>
                </div>
                <Button
                  onClick={() => navigate('/premium')}
                  className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 rounded-xl"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            )}

            {/* Profile Section */}
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 ${
                    isUltraPremium() 
                      ? 'border-purple-300 shadow-lg shadow-purple-200/50' 
                      : 'border-peach-300 shadow-lg shadow-peach-200/50'
                  } relative`}>
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${
                        isUltraPremium() 
                          ? 'bg-gradient-to-br from-purple-200 to-pink-200' 
                          : 'bg-gradient-to-br from-peach-200 to-coral-200'
                      } flex items-center justify-center`}>
                        <User className={`h-12 w-12 ${
                          isUltraPremium() ? 'text-purple-400' : 'text-peach-400'
                        }`} />
                      </div>
                    )}
                  </div>

                  {/* Camera Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`absolute -bottom-2 -right-2 w-10 h-10 ${
                      isUltraPremium() 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-peach-500 to-coral-500'
                    } text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] touch-manipulation`}
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <h2 className={`text-xl sm:text-2xl font-bold ${
                      isUltraPremium() ? 'text-purple-800' : 'text-gray-800'
                    }`}>
                      {username}
                    </h2>
                    <button
                      onClick={() => {
                        const newUsername = prompt("Enter new username:", username);
                        if (newUsername && newUsername.trim()) {
                          handleUsernameChange(newUsername.trim());
                        }
                      }}
                      className={`p-1 rounded-full hover:bg-gray-100 transition-colors min-h-[32px] min-w-[32px] touch-manipulation ${
                        isUltraPremium() ? 'text-purple-600' : 'text-gray-600'
                      }`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Coins className={`h-4 w-4 ${
                        isUltraPremium() ? 'text-purple-500' : 'text-yellow-500'
                      }`} />
                      <span className={`font-medium ${
                        isUltraPremium() ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {coins} coins
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={`${
                        isUltraPremium() ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading profile image...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isUltraPremium() 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                          : 'bg-gradient-to-r from-peach-500 to-coral-500'
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}

              {/* Referral Section */}
              <Card className={`mb-6 ${
                isUltraPremium() 
                  ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' 
                  : 'border-peach-200 bg-gradient-to-br from-peach-50 to-coral-50'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${
                    isUltraPremium() ? 'text-purple-800' : 'text-peach-800'
                  }`}>
                    <Gift className="h-5 w-5" />
                    {t('profile.referral.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isUltraPremium() ? 'text-purple-700' : 'text-peach-700'
                    }`}>
                      {t('profile.referral.id')}
                    </label>
                    <div className="flex gap-2">
                      <div className={`flex-1 px-3 py-2 ${
                        isUltraPremium() 
                          ? 'bg-purple-100 border border-purple-200' 
                          : 'bg-peach-100 border border-peach-200'
                      } rounded-lg font-mono text-center font-bold text-lg`}>
                        {referralCode}
                      </div>
                      <Button
                        onClick={copyReferralCode}
                        size="sm"
                        className={`${
                          isUltraPremium() 
                            ? 'bg-purple-500 hover:bg-purple-600' 
                            : 'bg-peach-500 hover:bg-peach-600'
                        } text-white min-h-[44px] min-w-[44px] touch-manipulation`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className={`p-3 ${
                    isUltraPremium() 
                      ? 'bg-purple-50 border border-purple-200' 
                      : 'bg-peach-50 border border-peach-200'
                  } rounded-lg`}>
                    <p className={`text-sm font-medium mb-2 ${
                      isUltraPremium() ? 'text-purple-800' : 'text-peach-800'
                    }`}>
                      {t('profile.referral.reward')}
                    </p>
                    <p className={`text-xs ${
                      isUltraPremium() ? 'text-purple-600' : 'text-peach-600'
                    }`}>
                      {t('profile.referral.share')}
                    </p>
                  </div>

                  <Button
                    onClick={shareReferralCode}
                    className={`w-full ${
                      isUltraPremium() 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                        : 'bg-gradient-to-r from-peach-500 to-coral-500 hover:from-peach-600 hover:to-coral-600'
                    } text-white font-semibold py-3 rounded-xl min-h-[44px] touch-manipulation`}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share Referral Code
                  </Button>
                </CardContent>
              </Card>

              {/* Settings Section */}
              <div className="space-y-3">
                <h3 className={`font-semibold text-lg ${
                  isUltraPremium() ? 'text-purple-800' : 'text-gray-800'
                }`}>
                  {t('profile.settings')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSettingsClick('privacy')}
                    variant="outline"
                    className={`flex items-center gap-3 p-4 h-auto justify-start ${
                      isUltraPremium() 
                        ? 'border-purple-200 text-purple-700 hover:bg-purple-50' 
                        : 'border-peach-200 text-peach-700 hover:bg-peach-50'
                    } min-h-[60px] touch-manipulation`}
                  >
                    <div className={`w-10 h-10 ${
                      isUltraPremium() ? 'bg-purple-100' : 'bg-peach-100'
                    } rounded-lg flex items-center justify-center`}>
                      <Shield className={`h-5 w-5 ${
                        isUltraPremium() ? 'text-purple-600' : 'text-peach-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{t('profile.settings.privacy')}</div>
                      <div className="text-xs opacity-75">Control your privacy</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleSettingsClick('notifications')}
                    variant="outline"
                    className={`flex items-center gap-3 p-4 h-auto justify-start ${
                      isUltraPremium() 
                        ? 'border-purple-200 text-purple-700 hover:bg-purple-50' 
                        : 'border-peach-200 text-peach-700 hover:bg-peach-50'
                    } min-h-[60px] touch-manipulation`}
                  >
                    <div className={`w-10 h-10 ${
                      isUltraPremium() ? 'bg-purple-100' : 'bg-peach-100'
                    } rounded-lg flex items-center justify-center`}>
                      <Bell className={`h-5 w-5 ${
                        isUltraPremium() ? 'text-purple-600' : 'text-peach-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{t('profile.settings.notifications')}</div>
                      <div className="text-xs opacity-75">Manage notifications</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleSettingsClick('account')}
                    variant="outline"
                    className={`flex items-center gap-3 p-4 h-auto justify-start ${
                      isUltraPremium() 
                        ? 'border-purple-200 text-purple-700 hover:bg-purple-50' 
                        : 'border-peach-200 text-peach-700 hover:bg-peach-50'
                    } min-h-[60px] touch-manipulation`}
                  >
                    <div className={`w-10 h-10 ${
                      isUltraPremium() ? 'bg-purple-100' : 'bg-peach-100'
                    } rounded-lg flex items-center justify-center`}>
                      <User className={`h-5 w-5 ${
                        isUltraPremium() ? 'text-purple-600' : 'text-peach-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{t('profile.settings.account')}</div>
                      <div className="text-xs opacity-75">Account management</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setShowLanguageSelector(true)}
                    variant="outline"
                    className={`flex items-center gap-3 p-4 h-auto justify-start ${
                      isUltraPremium() 
                        ? 'border-purple-200 text-purple-700 hover:bg-purple-50' 
                        : 'border-peach-200 text-peach-700 hover:bg-peach-50'
                    } min-h-[60px] touch-manipulation`}
                  >
                    <div className={`w-10 h-10 ${
                      isUltraPremium() ? 'bg-purple-100' : 'bg-peach-100'
                    } rounded-lg flex items-center justify-center`}>
                      <Globe className={`h-5 w-5 ${
                        isUltraPremium() ? 'text-purple-600' : 'text-peach-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{t('profile.settings.language')}</div>
                      <div className="text-xs opacity-75">Change language</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setShowHelpModal(true)}
                    variant="outline"
                    className={`flex items-center gap-3 p-4 h-auto justify-start ${
                      isUltraPremium() 
                        ? 'border-purple-200 text-purple-700 hover:bg-purple-50' 
                        : 'border-peach-200 text-peach-700 hover:bg-peach-50'
                    } min-h-[60px] touch-manipulation`}
                  >
                    <div className={`w-10 h-10 ${
                      isUltraPremium() ? 'bg-purple-100' : 'bg-peach-100'
                    } rounded-lg flex items-center justify-center`}>
                      <HelpCircle className={`h-5 w-5 ${
                        isUltraPremium() ? 'text-purple-600' : 'text-peach-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Help & Support</div>
                      <div className="text-xs opacity-75">Get assistance</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => navigate('/storage-debug')}
                    variant="outline"
                    className={`flex items-center gap-3 p-4 h-auto justify-start ${
                      isUltraPremium() 
                        ? 'border-purple-200 text-purple-700 hover:bg-purple-50' 
                        : 'border-peach-200 text-peach-700 hover:bg-peach-50'
                    } min-h-[60px] touch-manipulation`}
                  >
                    <div className={`w-10 h-10 ${
                      isUltraPremium() ? 'bg-purple-100' : 'bg-peach-100'
                    } rounded-lg flex items-center justify-center`}>
                      <Database className={`h-5 w-5 ${
                        isUltraPremium() ? 'text-purple-600' : 'text-peach-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Storage Debug</div>
                      <div className="text-xs opacity-75">Test Firebase Storage</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ULTRA+ Profile Enhancements */}
          {isUltraPremium() && (
            <div className="w-full mb-6">
              <UltraProfileEnhancements
                isUltraPremium={true}
                userProfile={userStats}
                onProfileUpdate={handleProfileUpdate}
              />
            </div>
          )}

          {/* Use UltraBottomNavBar for ULTRA+ users, regular for others */}
          {isUltraPremium() ? <UltraBottomNavBar /> : <BottomNavBar />}
        </main>
      </UltraPageTransition>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSettingType(null);
        }}
        settingType={settingType}
      />

      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />

      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
};

export default ProfilePage;