import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const q = query(collection(db, `insights/${u.uid}/daily`), orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => setInsights(snap.docs.map((d) => d.data())));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">智能洞察中心</h1>
      {insights.map((i, idx) => (
        <div key={idx} className="bg-white p-4 shadow rounded-xl">
          <p className="text-sm text-gray-700">{i.summary}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(i.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
