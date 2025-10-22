import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function RechargePage() {
  const [packs, setPacks] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "packages")).then((snap) =>
      setPacks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const handleBuy = async (packageId: string) => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_URL}/createCheckout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">积分充值中心</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((p) => (
          <div key={p.id} className="bg-white shadow rounded-2xl p-4">
            <h2 className="font-semibold text-lg">{p.name}</h2>
            <p className="text-gray-500 text-sm mb-2">共 {p.points} 积分</p>
            <p className="font-bold text-xl mb-4">¥{p.price}</p>
            <button
              onClick={() => handleBuy(p.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              立即充值
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
