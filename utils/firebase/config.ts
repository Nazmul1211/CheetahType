import { getApps, initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration with fallback values for deployment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'placeholder-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder-app-id',
};

// Initialize Firebase
let app;
let auth: Auth;
let storage;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only initialize Firebase if we're in a browser environment
if (isBrowser) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Create a dummy auth object for SSR
    auth = {} as Auth;
    storage = {};
  }
} else {
  // Create dummy objects for SSR
  auth = {} as Auth;
  storage = {};
}

export { auth, storage }; 