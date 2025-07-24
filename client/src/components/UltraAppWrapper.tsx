import { useEffect, useState, ReactNode } from "react";
import { Gem, Crown, Sparkles, Star, Zap, Heart, Users, Settings, Bell } from "lucide-react";
import { usePremium } from "../context/PremiumProvider";

interface UltraAppWrapperProps {
  children: ReactNode;
}

interface FloatingElement {
  id: string;
  x: number;
  y: number;
  icon: typeof Gem;
  color: string;
  size: number;
  speed: number;
}

export default function UltraAppWrapper({ children }: UltraAppWrapperProps) {
  const { isUltraPremium } = usePremium();
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  // Initialize floating elements for ULTRA+ users
  useEffect(() => {
    if (isUltraPremium()) {
      const elements: FloatingElement[] = [
        { id: '1', x: 10, y: 20, icon: Gem, color: 'text-purple-400/30', size: 16, speed: 1 },
        { id: '2', x: 80, y: 15, icon: Star, color: 'text-pink-400/30', size: 12, speed: 1.2 },
        { id: '3', x: 15, y: 70, icon: Sparkles, color: 'text-purple-300/30', size: 14, speed: 0.8 },
        { id: '4', x: 85, y: 80, icon: Crown, color: 'text-yellow-400/30', size: 18, speed: 1.1 },
        { id: '5', x: 50, y: 5, icon: Heart, color: 'text-rose-400/30', size: 10, speed: 1.3 },
        { id: '6', x: 30, y: 90, icon: Zap, color: 'text-blue-400/30', size: 12, speed: 0.9 },
      ];
      setFloatingElements(elements);

      // Show welcome message for new ULTRA+ sessions
      const lastWelcome = localStorage.getItem('ultra_last_welcome');
      const now = Date.now();
      if (!lastWelcome || now - parseInt(lastWelcome) > 24 * 60 * 60 * 1000) {
        setShowWelcome(true);
        localStorage.setItem('ultra_last_welcome', now.toString());
      }

      // Apply ULTRA+ theme to body
      document.body.classList.add('ultra-premium-app');
      
      // Add meta theme color for ULTRA+ users
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', '#a855f7');
      }
    } else {
      document.body.classList.remove('ultra-premium-app');
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', '#e11d48');
      }
    }

    return () => {
      document.body.classList.remove('ultra-premium-app');
    };
  }, [isUltraPremium]);

  if (!isUltraPremium()) {
    return <>{children}</>;
  }

  return (
    <div className="ultra-app-container relative min-h-screen bg-gray-50 safe-area-inset flex flex-col">
      {/* Mobile App Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-6 bg-gradient-to-r from-purple-600 to-pink-600 z-[100] flex items-center justify-between px-4 text-white text-xs safe-area-top">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold tracking-wide">ULTRA+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-white/90 text-xs font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <Bell className="w-3.5 h-3.5" />
          <div className="flex gap-0.5">
            <div className="w-1 h-2.5 bg-white/60 rounded-full"></div>
            <div className="w-1 h-2.5 bg-white/80 rounded-full"></div>
            <div className="w-1 h-2.5 bg-white rounded-full"></div>
            <div className="w-1 h-2.5 bg-white rounded-full"></div>
          </div>
          <div className="w-5 h-2.5 bg-white/80 rounded-sm relative">
            <div className="absolute top-0.5 right-0.5 bottom-0.5 w-1/2 bg-green-400 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Mobile App Header */}
      <div className="fixed top-6 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* App Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AjnabiCam</h1>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-purple-600">ULTRA+</span>
                <Crown className="h-3 w-3 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-purple-50/30" />
        {/* Floating Premium Elements - Subtle */}
        {floatingElements.slice(0, 3).map((element) => (
          <div
            key={element.id}
            className={`absolute animate-float-slow ${element.color} opacity-20`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDuration: `${6 + element.speed}s`,
              animationDelay: `${element.speed * 1}s`
            }}
          >
            <element.icon size={element.size * 0.8} />
          </div>
        ))}
      </div>

      {/* Mobile App Content */}
      <div className="flex-1 flex flex-col pt-20 pb-safe relative z-10">
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* ULTRA+ Welcome Modal */}
      {showWelcome && (
        <UltraWelcomeModal onClose={() => setShowWelcome(false)} />
      )}

      {/* Premium Loading Overlay for Page Transitions */}
      <UltraLoadingOverlay />
    </div>
  );
}

// ULTRA+ Welcome Modal
function UltraWelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md text-center shadow-2xl border border-purple-300 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-4 right-4 text-purple-200/30">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
        </div>
        <div className="absolute bottom-4 left-4 text-pink-200/30">
          <Star className="h-4 w-4 sm:h-6 sm:w-6 animate-pulse" />
        </div>

        <div className="relative z-10">
          {/* Crown Icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to ULTRA+</h2>
          <p className="text-purple-100 text-sm sm:text-base mb-6">
            Experience AjnabiCam like never before with exclusive premium features and unlimited possibilities!
          </p>

          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center gap-3 text-white">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-sm">No ads, unlimited chat time</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Heart className="h-4 w-4 text-pink-300" />
              <span className="text-sm">Premium reactions & face filters</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Users className="h-4 w-4 text-purple-300" />
              <span className="text-sm">Advanced friend features</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors duration-200"
          >
            Let's Begin! ✨
          </button>
        </div>
      </div>
    </div>
  );
}

// Premium Loading Overlay
function UltraLoadingOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  // Show loading overlay during route transitions for ULTRA+ users
  useEffect(() => {
    const handleRouteChange = () => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 800);
    };

    // Listen for navigation events
    window.addEventListener('beforeunload', handleRouteChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm z-[200] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-300 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <div className="text-white text-lg font-semibold">ULTRA+ Loading...</div>
        <div className="text-purple-200 text-sm">Preparing your premium experience</div>
      </div>
    </div>
  );
}
