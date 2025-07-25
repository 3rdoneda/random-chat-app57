import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePremium } from "../context/PremiumProvider";
import {
  Crown,
  Shield,
  Zap,
  Users,
  Heart,
  Eye,
  Star,
  Ban,
  Check,
  Settings,
  RotateCw,
  TestTube,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface ModeTestingPanelProps {
  onModeChange?: (mode: string) => void;
}

export default function ModeTestingPanel({ onModeChange }: ModeTestingPanelProps) {
  const { isPremium, isUltraPremium, isProMonthly, setPremium } = usePremium();
  const [isChanging, setIsChanging] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const getCurrentMode = () => {
    if (isUltraPremium()) return 'ultra+';
    if (isProMonthly()) return 'pro-monthly';
    return 'free';
  };

  const getModeDisplayName = (mode: string) => {
    switch (mode) {
      case 'ultra+': return 'ULTRA+';
      case 'pro-monthly': return 'Pro Monthly';
      case 'free': return 'Free';
      default: return 'Unknown';
    }
  };

  const switchToMode = async (mode: string) => {
    setIsChanging(true);
    try {
      if (mode === 'free') {
        await setPremium(false);
      } else if (mode === 'pro-monthly') {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        await setPremium(true, expiry, 'pro-monthly');
      } else if (mode === 'ultra+') {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 3);
        await setPremium(true, expiry, 'ultra-quarterly');
      }
      
      onModeChange?.(mode);
      
      // Test current mode features
      testCurrentModeFeatures(mode);
      
    } catch (error) {
      console.error('Failed to switch mode:', error);
      alert('Failed to switch mode. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };

  const testCurrentModeFeatures = (mode: string) => {
    const features = {
      adsShown: mode === 'free',
      profileViews: mode !== 'free',
      unlimitedChats: mode === 'ultra+',
      premiumFilters: mode !== 'free',
      prioritySupport: mode === 'ultra+',
      advancedAnalytics: mode === 'ultra+',
      secretLikes: mode !== 'free',
      profileBoost: mode === 'ultra+',
    };

    setTestResults({
      mode,
      features,
      testedAt: new Date().toLocaleTimeString(),
    });
  };

  const modes = [
    {
      id: 'free',
      name: 'Free',
      icon: Users,
      color: 'from-gray-400 to-gray-500',
      borderColor: 'border-gray-300',
      description: 'Basic features with ads',
      features: [
        { name: 'Basic chat', available: true },
        { name: 'Limited matches', available: true },
        { name: 'Ads shown', available: true, isLimitation: true },
        { name: 'Profile views', available: false },
        { name: 'Secret likes', available: false },
      ]
    },
    {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      icon: Shield,
      color: 'from-blue-500 to-purple-500',
      borderColor: 'border-blue-300',
      description: 'Enhanced features, ad-free',
      features: [
        { name: 'Ad-free experience', available: true },
        { name: 'See profile views', available: true },
        { name: 'Reveal secret likes', available: true },
        { name: 'Premium filters', available: true },
        { name: 'Unlimited chats', available: false },
      ]
    },
    {
      id: 'ultra+',
      name: 'ULTRA+',
      icon: Crown,
      color: 'from-yellow-400 to-amber-500',
      borderColor: 'border-yellow-300',
      description: 'All premium features unlocked',
      features: [
        { name: 'Everything in Pro', available: true },
        { name: 'Unlimited chats', available: true },
        { name: 'Priority support', available: true },
        { name: 'Advanced analytics', available: true },
        { name: 'Profile boost', available: true },
      ]
    }
  ];

  const currentMode = getCurrentMode();

  return (
    <div className="space-y-6 bg-gradient-to-r from-indigo-50 to-purple-100 p-6 rounded-2xl border border-indigo-200">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <TestTube className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-indigo-900">Mode Testing Panel</h2>
          <Settings className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-indigo-700">Test all subscription modes and their features</p>
      </div>

      {/* Current Mode Display */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-indigo-300 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Current Mode</h3>
                <p className="text-sm text-gray-600">Active subscription tier</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{getModeDisplayName(currentMode)}</div>
              <div className="text-sm text-gray-500">
                {currentMode === 'free' && '🆓 Basic features'}
                {currentMode === 'pro-monthly' && '💎 Premium features'}
                {currentMode === 'ultra+' && '👑 Ultimate experience'}
              </div>
            </div>
          </div>

          {/* Mode Status Indicators */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className={`p-3 rounded-xl text-center ${currentMode === 'free' ? 'bg-gray-100 border-2 border-gray-300' : 'bg-gray-50'}`}>
              <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <div className={`text-sm font-medium ${currentMode === 'free' ? 'text-gray-800' : 'text-gray-500'}`}>Free</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${currentMode === 'pro-monthly' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}`}>
              <Shield className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className={`text-sm font-medium ${currentMode === 'pro-monthly' ? 'text-blue-800' : 'text-gray-500'}`}>Pro</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${currentMode === 'ultra+' ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-gray-50'}`}>
              <Crown className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
              <div className={`text-sm font-medium ${currentMode === 'ultra+' ? 'text-yellow-800' : 'text-gray-500'}`}>ULTRA+</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection Grid */}
      <div className="grid gap-4">
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <Card 
              key={mode.id} 
              className={`transition-all duration-300 hover:shadow-xl ${
                isActive 
                  ? `border-2 ${mode.borderColor} bg-white shadow-lg transform scale-105` 
                  : 'border border-gray-200 bg-white/80 hover:bg-white'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${mode.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {mode.name}
                        {isActive && <Check className="w-5 h-5 text-green-500" />}
                      </h3>
                      <p className="text-gray-600">{mode.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => switchToMode(mode.id)}
                    disabled={isChanging || isActive}
                    className={`${
                      isActive 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : `bg-gradient-to-r ${mode.color} hover:opacity-90`
                    } text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 disabled:opacity-50`}
                  >
                    {isChanging ? (
                      <Refresh className="w-4 h-4 animate-spin" />
                    ) : isActive ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Active
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Test {mode.name}
                      </>
                    )}
                  </Button>
                </div>

                {/* Feature List */}
                <div className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {feature.available ? (
                        <Check className={`w-4 h-4 ${feature.isLimitation ? 'text-red-500' : 'text-green-500'}`} />
                      ) : (
                        <Ban className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${
                        feature.available 
                          ? feature.isLimitation 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-700'
                          : 'text-gray-400'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Test Results */}
      {testResults.mode && (
        <Card className="bg-white/90 backdrop-blur-sm border border-green-300 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <TestTube className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Test Results</h3>
                <p className="text-sm text-gray-600">Last tested: {testResults.testedAt}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Testing {getModeDisplayName(testResults.mode)} features:
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(testResults.features).map(([feature, available]) => (
                  <div key={feature} className="flex items-center gap-2">
                    {available ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Ban className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => testCurrentModeFeatures(currentMode)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <TestTube className="w-5 h-5 mr-2" />
          Test Current Mode
        </Button>
        
        <Button
          onClick={() => {
            setTestResults({});
            window.location.reload();
          }}
          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset Tests
        </Button>
      </div>

      {/* Usage Instructions */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            How to Test:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click "Test [Mode]" to switch to that subscription tier</li>
            <li>• Refresh the page after switching to see UI changes</li>
            <li>• Check ad visibility, premium features, and UI elements</li>
            <li>• Use "Test Current Mode" to verify feature availability</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
