import { auth } from "firebase-functions/v1";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 👤 当新用户注册时触发
 */
export const onUserCreate = auth.user().onCreate(async (user) => {
  console.log("✅ New user created:", user.uid);

  await db.collection("users").doc(user.uid).set({
    email: user.email,
    createdAt: new Date(),
    points: 0,
    level: "starter",
    role: "user",
  });
});
