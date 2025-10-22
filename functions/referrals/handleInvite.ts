import { onRequest } from "firebase-functions/v2/https"

import admin from "firebase-admin";
const db = admin.firestore();

export const handleInvite = onRequest(async (req, res) => {
  const { inviterId, inviteeId } = req.body;
  if (!inviterId || !inviteeId) {
    res.status(400).json({ error: "缺少参数" });
    return;
  }

  const inviterRef = db.doc(`users/${inviterId}`);
  const inviteeRef = db.doc(`users/${inviteeId}`);
  await db.runTransaction(async (t) => {
    const inviter = await t.get(inviterRef);
    const iPts = inviter.data().points || 0;
    t.update(inviterRef, { points: iPts + 20 });
    t.update(inviteeRef, { invitedBy: inviterId, points: 50 });
  });

  res.json({ success: true });
});


export const handleSlash = onRequest(async (req, res) => {
  const { activityId, helperId } = req.body;
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const discount = rand(1, 10); // 砍价金额
  await db.collection("slash").doc(activityId).collection("helpers").doc(helperId).set({
    discount,
    createdAt: Date.now(),
  });
  res.json({ discount });
});
