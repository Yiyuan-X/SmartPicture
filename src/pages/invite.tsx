import { useState } from "react";
import Head from "next/head";
import { referral } from "../utils/api";

export default function Invite() {
  const [inviteeId, setInviteeId] = useState("");
  const [msg, setMsg] = useState<string>("");

  const send = async () => {
    try {
      const r = await referral(inviteeId);
      setMsg(`邀请成功：邀请者 +${r.inviterReward}，新用户 +${r.inviteeReward}`);
    } catch (e:any) {
      setMsg(`失败：${e.message || "ERROR"}`);
    }
  };

  return (
    <>
      <Head><title>邀请裂变 | SmartPicture</title></Head>
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">邀请好友赢积分</h1>
        <input className="w-full border p-2 mt-4" placeholder="输入好友 uid" value={inviteeId} onChange={e=>setInviteeId(e.target.value)} />
        <button className="mt-3 px-3 py-2 bg-blue-600 text-white rounded" onClick={send}>发送邀请</button>
        {msg && <p className="mt-4">{msg}</p>}
      </main>
    </>
  );
}
