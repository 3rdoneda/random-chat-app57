// src/config/firebase.config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Environment validation
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

// Validate environment variables
function validateEnvironment() {
  const missing = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }
  
  console.log('✅ Firebase environment variables validated');
}

// Validate environment on startup
validateEnvironment();

// ✅ Secure Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ✅ Prevent duplicate initialization
const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Add error handling for Firebase initialization
if (!firebaseApp) {
  console.error("❌ Failed to initialize Firebase app");
  throw new Error("Firebase initialization failed");
}

console.log("✅ Firebase app initialized successfully");

// ✅ Core exports
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export { firebaseApp };

// ✅ Analytics (only in production + HTTPS)
let analytics: any = null;

if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(firebaseApp);
        console.log("✅ Firebase Analytics initialized");
      }
    })
    .catch(() => {
      console.warn("⚠️ Firebase Analytics not supported");
      analytics = null;
    });
}

export { analytics };

// ✅ Configuration validation for production
export function validateFirebaseConfig() {
  const issues: string[] = [];
  
  // Check if we're using demo/development URLs
  if (firebaseConfig.authDomain?.includes('demo') || 
      firebaseConfig.projectId?.includes('demo')) {
    issues.push('Using demo Firebase project in production');
  }
  
  // Check if API key looks like a placeholder
  if (firebaseConfig.apiKey?.includes('your_') || 
      firebaseConfig.apiKey?.length < 30) {
    issues.push('Firebase API key appears to be placeholder');
  }
  
  // Check storage bucket
  if (!firebaseConfig.storageBucket) {
    issues.push('Firebase Storage bucket not configured');
  }
  
  if (issues.length > 0 && import.meta.env.PROD) {
    console.error('🚨 Firebase configuration issues:', issues);
    // Don't throw in production, just log warnings
    console.warn('⚠️ Please review Firebase configuration before production deployment');
  }
  
  return issues.length === 0;
}

// Auto-validate in development
if (import.meta.env.DEV) {
  validateFirebaseConfig();
}
