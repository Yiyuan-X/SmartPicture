// 📁 文件：src/pages/InvitePage.jsx
import React, { useState } from "react";
import { sendReferral } from "../hooks/useReferral";

export default function InvitePage() {
  const [inviteeId, setInviteeId] = useState("");
  const [result, setResult] = useState(null);

  const handleInvite = async () => {
    const data = await sendReferral(inviteeId);
    setResult(data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>邀请好友赚积分</h2>
      <input
        value={inviteeId}
        onChange={(e) => setInviteeId(e.target.value)}
        placeholder="输入好友ID"
      />
      <button onClick={handleInvite}>发送邀请</button>

      {result && (
        <div>
          <p>邀请结果: {result.message}</p>
          {result.inviterReward && (
            <p>奖励积分：{result.inviterReward} / {result.inviteeReward}</p>
          )}
        </div>
      )}
    </div>
  );
}
