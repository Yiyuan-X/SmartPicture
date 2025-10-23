const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (!apiKey || !authDomain || !projectId || !appId) {
  console.warn(
    "Firebase Web 配置缺失，请在环境变量中提供 NEXT_PUBLIC_FIREBASE_API_KEY/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN/NEXT_PUBLIC_FIREBASE_PROJECT_ID/NEXT_PUBLIC_FIREBASE_APP_ID。"
  );
}

export const firebaseClientConfig = {
  apiKey: "AIzaSyDemn0sPPxLzzqgOrnSAqii2aigXLfsaxg",
  authDomain: "all-74802152-9ef06.firebaseapp.com",
  projectId: "all-74802152-9ef06",
  storageBucket: "all-74802152-9ef06.firebasestorage.app",
  messagingSenderId: "102333595083",
  appId: "1:102333595083:web:a9767c82e3f26b56f4ca4e",
  measurementId: "G-QL4CJJLCJD"
};

