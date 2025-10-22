import { onSchedule } from "firebase-functions/v2/scheduler";
import admin from "firebase-admin";
import { vertexSummarize } from "../utils/vertexClient";
import { collectUserStats } from "../utils/collectUserStats";


if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 🧠 Daily AI Insights Job
 * 每 24 小时自动运行一次，从 Firestore 收集用户数据，
 * 调用 Vertex AI 生成智能总结，并写回 Firestore。
 */
export const dailyInsights = onSchedule(
  { schedule: "0 0 * * *", timeZone: "Asia/Shanghai" },
  async () => {
    console.log("🚀 Starting daily insights generation...");

    try {
      // 1️⃣ 读取所有用户
      const usersSnapshot = await db.collection("users").get();
      if (usersSnapshot.empty) {
        console.log("⚠️ No users found.");
        return null;
      }

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0]; // yyyy-mm-dd

      // 2️⃣ 循环分析每个用户
      for (const doc of usersSnapshot.docs) {
        const userId = doc.id;
        const userData = doc.data();

        console.log(`📊 Processing user: ${userId}`);

        // 获取统计数据
        const stats = await collectUserStats(userId);

        // 调用 Vertex AI 生成总结
        const summary = await vertexSummarize({
          userId,
          stats,
          meta: {
            email: userData.email || "",
            level: userData.level || "starter",
          },
        });

        console.log(`✅ Insight for ${userId}: ${summary}`);

        // 3️⃣ 写入 Firestore (insights/{uid}/{yyyy-mm-dd})
        await db
          .collection("insights")
          .doc(userId)
          .collection("daily")
          .doc(dateStr)
          .set({
            summary,
            stats,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      }

      console.log("🎉 Daily AI Insights completed successfully.");
      return null;
    } catch (err) {
      console.error("❌ Error generating insights:", err);
      throw err;
    }
  }
);
