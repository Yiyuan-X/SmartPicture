/**
 * SmartPicture Growth Engine (裂变 + 砍价 + 积分激励 + 后台管理)
 * Author: Yiyuan (AI Growth Tools Matrix)
 */

import { auth as functionsAuth } from "firebase-functions/v1";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// --- 工具函数 ---
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const weightedPick = (weights: Record<string, number>) => {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [key, w] of Object.entries(weights)) {
    r -= w;
    if (r <= 0) return key;
  }
  return Object.keys(weights)[0];
};

// --- 🔐 鉴权与角色 ---
async function requireAuth(req: any) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) throw new Error("AUTH_HEADER_MISSING");
  const token = h.split("Bearer ")[1];
  const decoded = await auth.verifyIdToken(token);
  return decoded.uid;
}

async function requireAdmin(uid: string) {
  const userRef = await db.collection("users").doc(uid).get();
  if (!userRef.exists || userRef.data()?.role !== "admin") {
    throw new Error("PERMISSION_DENIED");
  }
}

// === 1️⃣ 注册奖励 ===
export const onAuthCreate = functionsAuth.user().onCreate(async (user) => {
  await db.collection("users").doc(user.uid).set(
    {
      points: 100,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      level: "bronze",
      role: "user",
    },
    { merge: true }
  );
});

// === 2️⃣ 邀请奖励 ===
export const referral = onRequest(async (req, res) => {
  try {
    const inviterId = await requireAuth(req);
    const { inviteeId } = req.body || {};
    if (!inviteeId || inviteeId === inviterId) throw new Error("INVALID_INVITE");

    const q = await db
      .collection("referrals")
      .where("inviterId", "==", inviterId)
      .where("inviteeId", "==", inviteeId)
      .limit(1)
      .get();
    if (!q.empty) throw new Error("ALREADY_INVITED");

    const inviterReward = rand(80, 200);
    const inviteeReward = rand(120, 260);
    const batch = db.batch();

    batch.set(
      db.collection("users").doc(inviterId),
      { points: admin.firestore.FieldValue.increment(inviterReward) },
      { merge: true }
    );
    batch.set(
      db.collection("users").doc(inviteeId),
      {
        points: admin.firestore.FieldValue.increment(inviteeReward),
        invitedBy: inviterId,
      },
      { merge: true }
    );
    batch.create(db.collection("referrals").doc(), {
      inviterId,
      inviteeId,
      inviterReward,
      inviteeReward,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    res.json({ inviterReward, inviteeReward, message: "✅ Referral success" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// === 3️⃣ 发起砍价活动 ===
export const slashStart = onRequest(async (req, res) => {
  try {
    const uid = await requireAuth(req);
    const { amount } = req.body || {};
    const original = Number(amount) > 0 ? Number(amount) : 100;
    const target = Math.max(5, Math.floor(original * 0.15));

    const campaign = await db.collection("campaigns").add({
      creator: uid,
      originalPrice: original,
      targetPrice: target,
      currentPrice: original,
      helpers: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active",
    });

    res.json({
      campaignId: campaign.id,
      originalPrice: original,
      targetPrice: target,
      shareLink: `https://smartpicture.ai/slash/${campaign.id}`,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// === 4️⃣ 帮砍一刀 ===
export const slashHelp = onRequest(async (req, res) => {
  try {
    const helperId = await requireAuth(req);
    const { campaignId } = req.body || {};
    if (!campaignId) throw new Error("CAMPAIGN_MISSING");

    const ref = db.collection("campaigns").doc(campaignId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      const c = snap.data()!;
      if (c.helpers.includes(helperId)) throw new Error("ALREADY_HELPED");

      const scenario = weightedPick({
        smallCut: 60,
        bigCut: 25,
        free: 5,
        bonus: 10,
      });
      let cut = 0;
      if (scenario === "smallCut") cut = Math.floor(c.originalPrice * rand(2, 6) / 100);
      if (scenario === "bigCut") cut = Math.floor(c.originalPrice * rand(8, 15) / 100);
      if (scenario === "free") cut = c.currentPrice;
      if (scenario === "bonus") cut = Math.floor(c.originalPrice * rand(4, 9) / 100);

      const newPrice = Math.max(c.targetPrice, c.currentPrice - cut);
      tx.update(ref, {
        currentPrice: newPrice,
        helpers: [...c.helpers, helperId],
        lastScenario: scenario,
      });

      const points = scenario === "bonus" ? 30 : 10;
      tx.set(
        db.collection("users").doc(helperId),
        { points: admin.firestore.FieldValue.increment(points) },
        { merge: true }
      );
    });

    const after = await ref.get();
    res.json({
      campaignId,
      scenario: after.data()?.lastScenario,
      newPrice: after.data()?.currentPrice,
      message:
        after.data()?.lastScenario === "free"
          ? "🎉 恭喜！本次砍到免单价！"
          : "砍价成功，积分已到账！",
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// === 5️⃣ 每日签到奖励 ===
export const dailyBonus = onSchedule(
  { schedule: "every 24 hours", timeZone: "Asia/Shanghai" },
  async () => {
    const users = await db.collection("users").get();
    const batch = db.batch();
    users.forEach((doc) =>
      batch.update(doc.ref, {
        points: admin.firestore.FieldValue.increment(10),
      })
    );
    await batch.commit();
  }
);
