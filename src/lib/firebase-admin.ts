import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount(): ServiceAccount | undefined {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      return JSON.parse(serviceAccountJson);
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", error);
      return undefined;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  return undefined;
}

let app: App | undefined;

export function getFirebaseAdminApp() {
  if (app) return app;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error("Firebase service account credentials are not configured.");
  }

  app =
    getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
        })
      : getApps()[0];

  return app;
}

export async function verifyIdToken(idToken: string) {
  const adminApp = getFirebaseAdminApp();
  const auth = getAuth(adminApp);
  return auth.verifyIdToken(idToken);
}
