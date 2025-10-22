import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { PointsCard } from "@/components/PointsCard";
import { InsightFeed } from "@/components/InsightFeed";
import { useRouter } from "next/router";

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) router.push("/login");
      else {
        setUser(u);
        const ref = doc(db, "users", u.uid);
        onSnapshot(ref, (snap) => setPoints(snap.data()?.points || 0));
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">个人控制台</h1>
      <PointsCard points={points} />
      <InsightFeed uid={user?.uid} />
    </div>
  );
}
