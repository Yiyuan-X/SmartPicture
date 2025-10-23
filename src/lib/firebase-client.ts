import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { firebaseClientConfig } from "../../firebase.config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analyticsPromise: Promise<Analytics | null> | undefined;

export function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseClientConfig);
  }
  return app;
}

export function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => {
        if (!supported) return null;
        return getAnalytics(getFirebaseApp());
      })
      .catch(() => null);
  }

  return analyticsPromise;
}
