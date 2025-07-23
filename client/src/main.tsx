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
  console.log("✅ React app rendered successfully");
} catch (error) {
  console.error("❌ Failed to render React app:", error);
}
