import { initializeApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Check if valid production Firebase config exists
const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes("YOUR_") &&
  !apiKey.includes("CzIpvdpnLk6Dske8dBwt9tzahZMspZoHc")
);

const firebaseConfig = {
  apiKey: isFirebaseConfigured ? apiKey : undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: isFirebaseConfigured ? projectId : undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = getApps()[0];
if (!app && isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (err) {
    console.warn("[firebase] App initialization skipped:", err?.message || err);
  }
}

let auth = null;
if (app && isFirebaseConfigured) {
  try {
    auth = getAuth(app);
  } catch (err) {
    console.warn("[firebase] Auth initialization skipped:", err?.message || err);
  }
}

// Initialize Analytics if supported
let analytics = null;
if (typeof window !== "undefined" && app && isFirebaseConfigured) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { auth, RecaptchaVerifier, signInWithPhoneNumber, analytics, isFirebaseConfigured };
