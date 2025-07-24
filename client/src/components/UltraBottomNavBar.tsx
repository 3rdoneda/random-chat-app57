import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  Bot,
  Users,
  User,
  Gem,
  Crown,
  Sparkles,
  Zap,
  Heart
} from "lucide-react";
import { usePremium } from "../context/PremiumProvider";
import { useHaptics } from "../lib/haptics";

export default function UltraBottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isUltraPremium } = usePremium();
  const { buttonTap, selectionChange, premiumAction } = useHaptics();
  const [activeTab, setActiveTab] = useState('');

  const tabs = [
    {
      id: 'home',
      path: '/',
      icon: Home,
      label: 'Home',
      color: 'from-rose-400 to-pink-400'
    },
    {
      id: 'chat',
      path: '/video-chat',
      icon: MessageCircle,
      label: 'Chat',
      color: 'from-pink-400 to-rose-400'
    },
    {
      id: 'ai',
      path: '/ai-chatbot',
      icon: Bot,
      label: 'AI Chat',
      color: 'from-amber-400 to-orange-400'
    },
    {
      id: 'friends',
      path: '/friends',
      icon: Users,
      label: 'Friends',
      color: 'from-orange-400 to-amber-400'
    },
    {
      id: 'profile',
      path: '/profile',
      icon: User,
      label: 'Profile',
      color: 'from-rose-400 to-pink-400'
    }
  ];

  useEffect(() => {
    const currentTab = tabs.find(tab => 
      tab.path === location.pathname || 
      (tab.path !== '/' && location.pathname.startsWith(tab.path))
    );
    setActiveTab(currentTab?.id || 'home');
  }, [location.pathname]);

  const handleTabClick = (tab: typeof tabs[0]) => {
    // Haptic feedback for tab selection
    selectionChange();
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  if (!isUltraPremium()) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      {/* Mobile App Style Background */}
      <div className="absolute inset-0 bg-rose-50/95 border-t border-rose-200/50 shadow-2xl" />
      
      {/* ULTRA+ Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient-shift" />
      
      <div className="relative px-4 py-2 pb-safe">

        {/* Navigation Tabs - Mobile App Style */}
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 touch-action-manipulation min-w-[60px] ${
                  isActive
                    ? 'scale-105'
                    : 'scale-100 hover:scale-105 active:scale-95'
                }`}
              >
                {/* Active Tab Background */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl shadow-lg opacity-90`} />
                )}

                {/* Tab Content */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {/* Icon */}
                  <div className={`relative p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20'
                      : 'hover:bg-gray-100 active:bg-gray-200'
                  }`}>
                    <IconComponent
                      className={`h-5 w-5 transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-amber-600'
                      }`}
                    />
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute -top-0.5 -right-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-rose-400'
                  }`}>
                    {tab.label}
                  </span>
                </div>




              </button>
            );
          })}
        </div>


      </div>


    </div>
  );
}

// Premium Page Transition Component
export function UltraPageTransition({ children }: { children: React.ReactNode }) {
  const { isUltraPremium } = usePremium();
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!isUltraPremium()) {
    return <>{children}</>;
  }

  return (
    <div className="ultra-page-wrapper">
      {/* Premium Page Border */}
      <div className="fixed inset-2 border border-purple-200/50 rounded-3xl pointer-events-none z-10 shadow-2xl shadow-purple-500/5" />
      
      {/* Content with Premium Styling */}
      <div className="relative z-20 min-h-screen">
        {children}
      </div>

      {/* Premium Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-purple-700 font-semibold">ULTRA+ Transition</div>
          </div>
        </div>
      )}
    </div>
  );
}
