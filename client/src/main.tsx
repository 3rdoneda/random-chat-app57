import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./context/SocketProvider.tsx";

import { ThemeProvider } from "./components/theme-provider.tsx";
import { LanguageProvider } from "./context/LanguageProvider.tsx";
import { PremiumProvider } from "./context/PremiumProvider.tsx";
import { CoinProvider } from "./context/CoinProvider.tsx";
import { FriendsProvider } from "./context/FriendsProvider.tsx";
import { HelmetProvider } from "react-helmet-async";
import { preloadSounds } from "./lib/audio.ts";

// Add debugging
console.log("🚀 App starting up...");

// Preload sounds on app start (with error handling)
try {
  preloadSounds();
  console.log("✅ Sounds preloaded successfully");
} catch (error) {
  console.error("⚠️ Sound preloading failed:", error);
}

// Error fallback component
function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button onClick={resetErrorBoundary} className="bg-blue-500 text-white px-4 py-2 rounded">
          Try again
        </button>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Root element not found!");
  throw new Error("Root element not found");
}

console.log("✅ Root element found, rendering React app...");

// Test minimal rendering first
try {
  console.log("���� Testing minimal React render...");
  createRoot(rootElement).render(
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀 AjnabiCam Loading...</h1>
        <p>Testing React render - if you see this, React is working!</p>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          margin: '20px auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
  console.log("✅ Minimal React app rendered successfully");

  // Try to render full app after 2 seconds
  setTimeout(() => {
    console.log("🔄 Now attempting full app render...");
    try {
      createRoot(rootElement).render(
        <StrictMode>
          <HelmetProvider>
            <LanguageProvider>
              <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <PremiumProvider>
                  <CoinProvider>
                    <FriendsProvider>
                      <BrowserRouter>
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <SocketProvider>
                            <ErrorBoundary FallbackComponent={ErrorFallback}>
                              <App />
                            </ErrorBoundary>
                          </SocketProvider>
                        </ErrorBoundary>
                      </BrowserRouter>
                    </FriendsProvider>
                  </CoinProvider>
                </PremiumProvider>
              </ThemeProvider>
            </LanguageProvider>
          </HelmetProvider>
        </StrictMode>
      );
      console.log("✅ Full React app rendered successfully");
    } catch (fullAppError) {
      console.error("❌ Failed to render full app:", fullAppError);
    }
  }, 2000);

} catch (error) {
  console.error("❌ Failed to render minimal React app:", error);
}
