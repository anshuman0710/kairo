import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseStorage = null;

function hasFirebaseClientConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
}

function ensureBrowserRuntime() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client services are only available in the browser runtime.");
  }
}

function getFirebaseApp() {
  ensureBrowserRuntime();

  if (!hasFirebaseClientConfig()) {
    console.warn("Firebase client environment variables are missing.");
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!firebaseAuth) {
    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}

export function getFirebaseStorage() {
  const app = getFirebaseApp();
  if (!app) return null;

  
  if (!firebaseStorage) {
    firebaseStorage = getStorage(app);
  }

  return firebaseStorage;
}
