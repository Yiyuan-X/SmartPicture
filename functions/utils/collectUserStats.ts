import admin from "firebase-admin";
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ✅ 收集用户数据统计（示例）
export async function collectUserStats(uid: string) {
  const usageRef = db.collection("usage").doc(uid);
  const usage = await usageRef.get();
  if (!usage.exists) {
    return { sessions: 0, points: 0, lastActive: null };
  }
  return usage.data()!;
}
