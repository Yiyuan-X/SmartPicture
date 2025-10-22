import { onUserCreated } from "firebase-functions/v2/identity"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { onRequest } from "firebase-functions/v2/https"
/**
 * SmartPicture Growth Engine (裂变 + 砍价 + 积分激励)
 * Author: Yiyuan (AI Growth Tools Matrix)
 */

import * as functions from "firebase-functions/v2";
import admin from "firebase-admin";
import fetch from "node-fetch"; // 用于 Vertex AI 请求

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// --- 工具函数 ---
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const weightedPick = (weights) => {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [key, w] of Object.entries(weights)) {
    if ((r -= w) <= 0) return key;
  }
};

// --- 鉴权 ---
async function requireAuth(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) throw new Error("AUTH_HEADER_MISSING");
  const token = h.split("Bearer ")[1];
  const decoded = await auth.verifyIdToken(token);
  return decoded.uid;
}

// === 1️⃣ 注册奖励 ===
export const onAuthCreate = onUserCreated(async (user) => {
  await db.collection("users").doc(user.uid).set({
    points: 100,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    level: "bronze",
  }, { merge: true });
});

// === 2️⃣ 邀请奖励 ===
export const referral = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    const inviterId = await requireAuth(req);
    const { inviteeId } = req.body || {};
    if (!inviteeId) return res.status(400).json({ error: "INVITEE_MISSING" });
    if (inviteeId === inviterId) return res.status(400).json({ error: "SELF_INVITE" });

    const existing = await db.collection("referrals")
      .where("inviterId", "==", inviterId)
      .where("inviteeId", "==", inviteeId)
      .limit(1)
      .get();
    if (!existing.empty) return res.status(409).json({ error: "ALREADY_INVITED" });

    const inviterReward = rand(80, 200);
    const inviteeReward = rand(120, 260);

    const batch = db.batch();
    batch.set(db.collection("users").doc(inviterId),
      { points: admin.firestore.FieldValue.increment(inviterReward) },
      { merge: true });
    batch.set(db.collection("users").doc(inviteeId),
      { points: admin.firestore.FieldValue.increment(inviteeReward), invitedBy: inviterId },
      { merge: true });
    batch.create(db.collection("referrals").doc(), {
      inviterId, inviteeId, inviterReward, inviteeReward,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();

    res.json({ message: "OK", inviterReward, inviteeReward });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === 3️⃣ 发起砍价 ===
export const slashStart = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    const uid = await requireAuth(req);
    const { amount } = req.body || {};
    const original = Number(amount) > 0 ? Number(amount) : 100;
    const target = Math.max(5, Math.floor(original * 0.15)); // 底价最低 15%

    const campaign = await db.collection("campaigns").add({
      creator: uid,
      originalPrice: original,
      targetPrice: target,
      currentPrice: original,
      helpers: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active"
    });

    res.json({
      campaignId: campaign.id,
      originalPrice: original,
      targetPrice: target,
      shareLink: `https://smartpicture.ai/slash/${campaign.id}`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === 4️⃣ 帮砍一刀（动态规则） ===
export const slashHelp = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    const helperId = await requireAuth(req);
    const { campaignId } = req.body || {};
    if (!campaignId) return res.status(400).json({ error: "CAMPAIGN_MISSING" });

    const ref = db.collection("campaigns").doc(campaignId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      const c = snap.data();
      if (c.helpers.includes(helperId)) throw new Error("ALREADY_HELPED");

      // 动态砍价机制（营销智能逻辑）
      const scenario = weightedPick({
        "smallCut": 60,  // 常规砍价
        "bigCut": 25,    // 大幅砍价
        "free": 5,       // 直接免单
        "bonus": 10      // 给帮砍者额外积分
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
        lastScenario: scenario
      });

      const points = scenario === "bonus" ? 30 : 10;
      tx.set(db.collection("users").doc(helperId),
        { points: admin.firestore.FieldValue.increment(points) },
        { merge: true });
    });

    const after = await ref.get();
    res.json({
      campaignId,
      scenario: after.data().lastScenario,
      newPrice: after.data().currentPrice,
      message:
        after.data().lastScenario === "free"
          ? "🎉 恭喜！本次砍到免单价！"
          : "砍价成功！已自动记录积分 ✨"
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === 5️⃣ 每日签到 ===
export const dailyBonus = onSchedule("every 24 hours", async () => {
  const users = await db.collection("users").get();
  const batch = db.batch();
  users.forEach((doc) => {
    batch.update(doc.ref, {
      points: admin.firestore.FieldValue.increment(10),
    });
  });
  await batch.commit();
});

// === 6️⃣ （预留）AI 推荐触发 ===
export const aiRecommend = onRequest(async (req, res) => {
  try {
    const { userId } = req.body;
    const vertexEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GCLOUD_PROJECT}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`;

    const prompt = {
      contents: [{ role: "user", parts: [{ text: `为用户 ${userId} 推荐最易传播的营销商品` }] }],
    };

    const aiRes = await fetch(vertexEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GOOGLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    });

    const data = await aiRes.json();
    res.json({ recommendation: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
