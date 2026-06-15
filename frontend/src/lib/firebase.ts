import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForCompilation",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexora-ai-dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexora-ai-dummy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexora-ai-dummy.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:dummy",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DUMMY"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
