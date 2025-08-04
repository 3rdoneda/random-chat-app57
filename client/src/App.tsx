import React, { Suspense } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAnalytics } from "./hooks/useAnalytics";

import VideoChat from "./screens/VideoChat";
import SplashScreen from "./components/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import ReferToUnlock from "./screens/ReferToUnlock";
import ReferralCodeScreen from "./screens/ReferralCode";
import GenderSelect from "./screens/GenderSelect";
import ChatPage from "./screens/ChatPage";
import VoicePage from "./screens/VoicePage";
import HomePage from "./screens/HomePage";
import ProfilePage from "./screens/ProfilePage";
import StorageDebugPage from "./screens/StorageDebugPage";
import FirebaseDebugPage from "./screens/FirebaseDebugPage";
import UserSetup from "./screens/UserSetup";
import PersonalChat from "./screens/PersonalChat";
import FriendsPage from "./screens/FriendsPage";
import AIChatbotPage from "./screens/AIChatbotPage";
import AdTestingPage from "./screens/AdTestingPage";
import PremiumPage from "./screens/PremiumPage";
import PrivacyPolicyPage from "./screens/PrivacyPolicyPage";
import TermsOfServicePage from "./screens/TermsOfServicePage";
import AdminPanelPage from "./screens/AdminPanelPage";
import SpinWheel from "./components/SpinWheel";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PostCallProfile from "./screens/PostCallProfile";
import AppStartupCheck from "./components/AppStartupCheck";
import UltraAppWrapper from "./components/UltraAppWrapper";
import CookieConsent from "./components/CookieConsent";
import LegalFooter from "./components/LegalFooter";
import { initializeErrorMonitoring } from "./lib/errorMonitoring";

import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { ensureUserDocumentExists } from "./lib/firestoreUtils";
import { unityAdsService } from "./lib/unityAdsService";
import { adMobService } from "./lib/adMobMediationService";

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-peach-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading AjnabiCam...</p>
      </div>
    </div>
  );
}

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          {import.meta.env.DEV ? error.message : 'An unexpected error occurred'}
        </p>
        <button 
          onClick={resetErrorBoundary} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize analytics with error handling
  const initializeAnalytics = useCallback(() => {
    try {
      useAnalytics();
    } catch (error) {
      console.error("Analytics initialization failed:", error);
      // Don't crash the app for analytics failures
    }
  }, []);

  useEffect(() => {
    initializeAnalytics();
  }, [initializeAnalytics]);

  useEffect(() => {
    // Set up global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // Don't crash the app for non-critical errors
      if (event.error?.message?.includes('ResizeObserver') ||
          event.error?.message?.includes('Non-Error promise rejection') ||
          event.error?.message?.includes('Loading chunk')) {
        event.preventDefault();
        return;
      }
      setError(event.error?.message || 'An unexpected error occurred');
    };
    
    window.addEventListener('error', handleGlobalError);
    
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    // Initialize ad services
    const initializeAdServices = async () => {
      try {
        console.log('🎯 Initializing ad mediation services...');

        // Initialize Unity Ads first (higher priority)
        const unitySuccess = await unityAdsService.initialize();
        console.log(`🎮 Unity Ads: ${unitySuccess ? 'Ready' : 'Failed'}`);

        // Initialize AdMob mediation
        const mediationSuccess = await adMobService.initialize();
        console.log(`📱 AdMob Mediation: ${mediationSuccess ? 'Ready' : 'Failed'}`);

        if (unitySuccess) {
          console.log('✅ Unity Ads mediation is active - higher eCPM expected!');
        }
      } catch (error) {
        console.warn('⚠️ Ad service initialization failed (non-critical):', error);
      }
    };

    initializeAdServices();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  useEffect(() => {
    // Initialize error monitoring
    initializeErrorMonitoring();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ Make sure Firestore doc exists for logged-in user
        await ensureUserDocumentExists(user.uid);
        // Initialize error monitoring with user ID
        initializeErrorMonitoring(user.uid);
      } else {
        // ✅ Auto sign-in anonymously for new users
        try {
          await signInAnonymously(auth);
          console.log("✅ User signed in anonymously");
        } catch (error) {
          console.error("❌ Error signing in anonymously:", error);
        }
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Application Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show loading while authentication is initializing
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-peach-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AppStartupCheck>
      <UltraAppWrapper>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingScreen />}>
            <div className="app-container min-h-screen bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50 touch-manipulation native-scroll">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/onboarding" element={<OnboardingScreen />} />
                <Route path="/user-setup" element={<UserSetup />} />
                <Route path="/premium-trial" element={<ReferToUnlock />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/gender-select" element={<GenderSelect />} />
                <Route path="/video-chat" element={<VideoChat />} />
                <Route path="/voice" element={<VoicePage />} />
                <Route path="/personal-chat" element={<PersonalChat />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/refer" element={<ReferToUnlock />} />
                <Route path="/referral-code" element={<ReferralCodeScreen />} />
                <Route path="/ai-chatbot" element={<AIChatbotPage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/admin" element={<AdminPanelPage />} />
                <Route path="/spin-wheel" element={<SpinWheel />} />
                <Route path="/storage-debug" element={<StorageDebugPage />} />
                <Route path="/post-profile" element={<PostCallProfile />} />
                <Route path="/firebase-debug" element={<FirebaseDebugPage />} />
                <Route path="/ad-testing" element={<AdTestingPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>

              <PWAInstallPrompt />
              <CookieConsent />
              <LegalFooter />
            </div>
          </Suspense>
        </ErrorBoundary>
      </UltraAppWrapper>
    </AppStartupCheck>
  );
}

export default App;
