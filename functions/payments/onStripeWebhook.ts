import { onRequest } from "firebase-functions/v2/https"

import admin from "firebase-admin";
const db = admin.firestore();

export const onStripeWebhook = onRequest(async (req, res) => {
  try {
    const event = req.body;
    if (event.type === "checkout.session.completed") {
      const { uid, points } = event.data.object.metadata;
      const userRef = db.doc(`users/${uid}`);
      await db.runTransaction(async (t) => {
        const user = await t.get(userRef);
        const oldPoints = user.data().points || 0;
        t.update(userRef, { points: oldPoints + Number(points) });
        t.set(userRef.collection("transactions").doc(), {
          type: "recharge",
          amount: +points,
          remark: "积分充值成功",
          createdAt: Date.now(),
        });
      });
    }
    res.sendStatus(200);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
