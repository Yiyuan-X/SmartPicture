// 📁 文件：src/hooks/useReferral.js
import { getAuth } from "firebase/auth";

export async function sendReferral(inviteeId) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const token = await user.getIdToken();

    const res = await fetch(
      "https://us-central1-your-project-id.cloudfunctions.net/referral",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteeId }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Referral request failed");
    }

    const data = await res.json();
    console.log("🎁 Referral success:", data);
    return data;

  } catch (err) {
    console.error("❌ Referral failed:", err.message);
    return { error: err.message };
  }
}
