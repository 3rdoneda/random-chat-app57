import React, { Suspense } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
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
import SpinWheel from "./components/SpinWheel";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import AppStartupCheck from "./components/AppStartupCheck";
import UltraAppWrapper from "./components/UltraAppWrapper";

import { useNavigate } from "react-router-dom";

import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { ensureUserDocumentExists } from "./lib/firestoreUtils";

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


function App() {
  console.log("🏁 App component rendering...");

  const [showSplash, setShowSplash] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();

  // Error boundary for the app
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    console.log("❌ App has error state");
    return <div className="min-h-screen flex items-center justify-center"><p>Something went wrong. Please refresh the page.</p></div>;
  }

  console.log("📊 Skipping analytics for debugging...");
  // Initialize analytics (temporarily disabled for debugging)
  // useAnalytics();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ Make sure Firestore doc exists for logged-in user
        await ensureUserDocumentExists(user.uid);
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
        <Suspense fallback={<LoadingScreen />}>
        <div className="app-container">
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
            <Route path="/spin-wheel" element={<SpinWheel />} />
            <Route path="/storage-debug" element={<StorageDebugPage />} />
            <Route path="/firebase-debug" element={<FirebaseDebugPage />} />
            <Route path="/ad-testing" element={<AdTestingPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>

          <PWAInstallPrompt />
        </div>
        </Suspense>
      </UltraAppWrapper>
    </AppStartupCheck>
  );
}

export default App;
