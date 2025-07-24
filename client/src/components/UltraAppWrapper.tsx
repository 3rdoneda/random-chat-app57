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
    <div className="ultra-app-container relative min-h-screen overflow-hidden safe-area-inset">
      {/* Native App Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-6 sm:h-8 md:h-10 bg-gradient-to-r from-purple-600 to-pink-600 z-[100] flex items-center justify-between px-4 text-white text-xs sm:text-sm safe-area-top">
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

      {/* Global ULTRA+ Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Native App Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-purple-50/80 animate-gradient-shift" />
        
        {/* Floating Premium Elements */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className={`absolute animate-float-slow ${element.color}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDuration: `${3 + element.speed}s`,
              animationDelay: `${element.speed * 0.5}s`
            }}
          >
            <element.icon size={element.size} />
          </div>
        ))}

        {/* Premium Particle System */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-premium-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Native App Border Glow */}
        <div className="absolute inset-1 sm:inset-2 border border-purple-200/30 rounded-3xl sm:rounded-3xl shadow-2xl shadow-purple-500/10 animate-premium-glow" />
      </div>

      {/* ULTRA+ Status Indicator - Mobile Optimized */}
      <div className="fixed top-8 sm:top-12 md:top-14 left-3 z-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-lg rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl shadow-purple-500/30 animate-pulse border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
            <span className="text-white text-xs sm:text-sm font-bold tracking-wide">ULTRA+</span>
            <Gem className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Native App Quick Actions - Mobile Optimized */}
      <div className="fixed top-8 sm:top-12 md:top-14 right-3 z-50">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-2 border border-purple-300/30 shadow-lg">
          <div className="flex gap-1.5">
            <button className="p-2.5 bg-gradient-to-r from-purple-500/80 to-pink-500/80 rounded-xl hover:from-purple-600/80 hover:to-pink-600/80 transition-all duration-200 touch-action-manipulation active:scale-95 border border-white/20">
              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </button>
            <button className="p-2.5 bg-gradient-to-r from-pink-500/80 to-purple-500/80 rounded-xl hover:from-pink-600/80 hover:to-purple-600/80 transition-all duration-200 touch-action-manipulation active:scale-95 border border-white/20">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* App Content with Native Styling */}
      <div className="relative z-10 pt-6 sm:pt-8 md:pt-10 safe-area-inset">
        <div className="min-h-screen bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90 backdrop-blur-sm overflow-x-hidden">
          <div className="pb-safe">
            {children}
          </div>
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
