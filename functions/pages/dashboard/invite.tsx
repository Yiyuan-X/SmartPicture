import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useState } from "react";
import { auth } from "../../lib/firebase";

export default function InvitePage() {
  const [copied, setCopied] = useState(false);
  const user = auth.currentUser;
  const inviteUrl = `https://smartpicture.ai/?invite=${user?.uid}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">邀请中心</h1>
      <p className="text-gray-600">分享以下邀请链接给好友，双方可获得积分奖励 🎁</p>
      <div className="flex items-center space-x-2">
        <input readOnly value={inviteUrl} className="border rounded p-2 flex-1" />
        <button
          onClick={copyLink}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {copied ? "已复制!" : "复制"}
        </button>
      </div>
    </div>
  );
}
