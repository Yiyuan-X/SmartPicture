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
  apiKey: apiKey ?? "",
  authDomain: authDomain ?? "",
  projectId: projectId ?? "",
  appId: appId ?? "",
};

