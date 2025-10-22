import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 💎 自动更新用户等级
 * 每 24 小时执行一次，根据邀请人数升级等级
 */
export const updateLevel = onSchedule(
  {
    schedule: "0 0 * * *", // 每天 0 点触发
    timeZone: "Asia/Shanghai", // 设置时区
  },
  async () => {
    console.log("🚀 Starting daily user level update...");

    try {
      // 获取所有用户
      const usersSnapshot = await db.collection("users").get();

      if (usersSnapshot.empty) {
        console.log("⚠️ No users found.");
        return null;
      }

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // 查询邀请记录
        const invitesSnapshot = await db
          .collection("invites")
          .where("inviterId", "==", userId)
          .get();

        const inviteCount = invitesSnapshot.size;
        let level = "starter";

        if (inviteCount >= 100) level = "diamond";
        else if (inviteCount >= 30) level = "gold";
        else if (inviteCount >= 10) level = "silver";
        else if (inviteCount >= 3) level = "bronze";

        // 更新 Firestore 用户等级
        await db.doc(`users/${userId}`).update({ level });

        console.log(`✅ ${userId} -> ${level} (${inviteCount} invites)`);
      }

      console.log("🎉 User level update completed successfully.");
      return null;
    } catch (error) {
      console.error("❌ Error updating user levels:", error);
      throw error;
    }
  }
);
