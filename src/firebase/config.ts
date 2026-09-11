import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration - uses environment variables only
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
);

if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase not configured. Running with limited features.');
  console.warn('💡 To enable Firebase features (chat, file uploads, analytics):');
  console.warn('   1. Go to https://console.firebase.google.com/');
  console.warn('   2. Create a project and add a web app');
  console.warn('   3. Copy the config values to your .env file');
}

let app;
let db;
let storage;
let auth;
let analytics;

try {
  // Initialize Firebase only if configured
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    
    // Analytics is optional
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Firebase Analytics not available');
    }
  } else {
    console.warn('Firebase services disabled - not configured');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  console.warn('Running without Firebase. Some features will be limited.');
}

export { db, storage, auth, analytics };
export default app;
