import { getAuth } from "firebase/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;          // Cloud Run
const FN_BASE  = process.env.NEXT_PUBLIC_FUNCTIONS_BASE;    // Cloud Functions

type RequestPayload = Record<string, unknown>;

async function authedFetch<T>(url: string, body: RequestPayload): Promise<T> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("NOT_LOGGED_IN");
  const token = await user.getIdToken();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export type GenerateTextResponse = { generated_text: string };
export type GenerateImageResponse = { image: string };
export type ReferralResponse = { inviterReward: number; inviteeReward: number; message?: string };
export type SlashStartResponse = { campaignId: string; initialPrice: number };
export type SlashHelpResponse = {
  campaignId: string;
  currentPrice: number;
  helperPoints: number;
};

export const generateText = (prompt: string) =>
  authedFetch<GenerateTextResponse>(`${API_BASE}/api/generate_text`, { prompt });
export const generateImage = (prompt: string) =>
  authedFetch<GenerateImageResponse>(`${API_BASE}/api/generate_image`, { prompt });
export const referral = (inviteeId: string) =>
  authedFetch<ReferralResponse>(`${FN_BASE}/referral`, { inviteeId });
export const slashStart = (amount?: number) =>
  authedFetch<SlashStartResponse>(`${FN_BASE}/slashStart`, { amount });
export const slashHelp = (campaignId: string) =>
  authedFetch<SlashHelpResponse>(`${FN_BASE}/slashHelp`, { campaignId });
