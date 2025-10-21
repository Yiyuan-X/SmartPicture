import { getAuth } from "firebase/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;          // Cloud Run
const FN_BASE  = process.env.NEXT_PUBLIC_FUNCTIONS_BASE;    // Cloud Functions

async function authedFetch(url: string, body: any) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("NOT_LOGGED_IN");
  const token = await user.getIdToken();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const generateText  = (prompt: string) => authedFetch(`${API_BASE}/api/generate_text`, { prompt });
export const generateImage = (prompt: string) => authedFetch(`${API_BASE}/api/generate_image`, { prompt });
export const referral      = (inviteeId: string) => authedFetch(`${FN_BASE}/referral`, { inviteeId });
export const slashStart    = (amount?: number) => authedFetch(`${FN_BASE}/slashStart`, { amount });
export const slashHelp     = (campaignId: string) => authedFetch(`${FN_BASE}/slashHelp`, { campaignId });
