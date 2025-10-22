
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const auth = admin.auth();

export async function requireAuth(req: any) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) throw new Error("AUTH_HEADER_MISSING");
  const token = h.split("Bearer ")[1];
  const decoded = await auth.verifyIdToken(token);
  return decoded.uid;
}
