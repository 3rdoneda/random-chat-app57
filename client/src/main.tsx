import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary";
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
import { initializeSecurity } from "./lib/securityUtils.ts";
import PerformanceOptimizer from "./lib/performanceOptimizer.ts";
import NetworkManager from "./lib/networkManager.ts";

// Preload sounds on app start
try {
  preloadSounds();
} catch (error) {
  console.warn('Failed to preload sounds:', error);
}

// Initialize security measures
try {
  initializeSecurity();
} catch (error) {
  console.warn('Failed to initialize security:', error);
}

// Initialize performance optimizer
try {
  PerformanceOptimizer.getInstance().initialize();
} catch (error) {
  console.warn('Failed to initialize performance optimizer:', error);
}

// Initialize network manager
try {
  NetworkManager.getInstance();
} catch (error) {
  console.warn('Failed to initialize network manager:', error);
}

// Error fallback component
function GlobalErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          {import.meta.env.DEV ? error.message : 'An unexpected error occurred'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}

// Initialize app with error handling
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary fallback={<GlobalErrorFallback error={new Error('Application failed to load')} />}>
        <HelmetProvider>
          <LanguageProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <PremiumProvider>
                <CoinProvider>
                  <FriendsProvider>
                    <BrowserRouter>
                      <ErrorBoundary>
                        <SocketProvider>
                          <ErrorBoundary>
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
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // Fallback rendering
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fef2f2, #fce7f3);
      font-family: system-ui, -apple-system, sans-serif;
      padding: 1rem;
    ">
      <div style="
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        max-width: 400px;
        width: 100%;
      ">
        <div style="
          width: 4rem;
          height: 4rem;
          background: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
        ">⚠️</div>
        <h1 style="
          font-size: 1.5rem;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 1rem;
        ">Failed to Load AjnabiCam</h1>
        <p style="
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        ">
          We're having trouble starting the application. Please try refreshing the page.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.background='#2563eb'"
          onmouseout="this.style.background='#3b82f6'"
        >
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
