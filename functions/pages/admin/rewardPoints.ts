import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import { onCall } from 'firebase-functions/v2/https';
import { db, auth } from "../utils/firestore";


export const rewardPoints = onCall(async (data, context) => {
const { uid, amount } = data;
if (!context.auth?.token?.role || context.auth.token.role !== 'admin') {
throw new Error('PERMISSION_DENIED');
}
const userRef = db.doc(`users/${uid}`);
await db.runTransaction(async (t) => {
const snap = await t.get(userRef);
const current = (snap.data()?.points || 0) as number;
t.update(userRef, { points: current + Number(amount) });
t.set(userRef.collection('transactions').doc(), {
type: 'reward',
amount: Number(amount),
remark: '管理员手动发放',
createdAt: Date.now(),
});
});
return { success: true };
});