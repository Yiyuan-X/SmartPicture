import admin from "firebase-admin";
const db = admin.firestore();

export async function consumePoints(uid: string, cost: number, feature: string) {
  const ref = db.doc(`users/${uid}`);
  await db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    const current = snap.data().points || 0;
    if (current < cost) throw new Error("积分不足");
    t.update(ref, { points: current - cost });
    t.set(ref.collection("transactions").doc(), {
      type: "consume",
      amount: -cost,
      remark: `使用 ${feature}`,
      createdAt: Date.now(),
    });
  });
}
