import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useEffect, useState } from "react";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { resolveDashboardRoute } from "../../lib/resolve-dashboard";
import { PointsCard } from "@/components/PointsCard";
import { InsightFeed } from "@/components/InsightFeed";

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    let profileUnsubscribe: Unsubscribe | undefined;

    const authUnsubscribe = auth.onIdTokenChanged(async (currentUser) => {
      if (!currentUser) {
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        return;
      }

      const target = await resolveDashboardRoute(currentUser);
      if (target === "/admin") {
        if (typeof window !== "undefined") {
          window.location.replace("/admin");
        }
        return;
      }

      setUser(currentUser);

      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      const ref = doc(db, "users", currentUser.uid);
      profileUnsubscribe = onSnapshot(ref, (snap) => setPoints(snap.data()?.points || 0));
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">个人控制台</h1>
      <PointsCard points={points} />
      <InsightFeed uid={user?.uid} />
    </div>
  );
}
