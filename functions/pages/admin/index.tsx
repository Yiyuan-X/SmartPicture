import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { resolveDashboardRoute } from "../../lib/resolve-dashboard";
import { UserTable } from "./components/UserTable";
import { ReportCharts } from "./components/ReportCharts";
import { InsightsMonitor } from "./components/InsightsMonitor";
import { ManualReward } from "./components/ManualReward";
import { ReportExport } from "./components/ReportExport";
import { BigQueryDashboard } from "./components/BigQueryDashboard";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const target = await resolveDashboardRoute(user);
      if (target !== "/admin") {
        router.push(target);
        return;
      }

      setIsAuthorized(true);
    });

    return () => unsubscribe();
  }, [router]);

  if (!isAuthorized) {
    return <div className="p-8 text-center">权限验证中...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-orange-600">SmartPicture 管理控制台</p>
        <h1 className="text-3xl font-bold text-gray-900">增长中枢 · 管理后台</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <UserTable />
          <ReportCharts />
          <InsightsMonitor />
        </div>
        <div className="space-y-6">
          <ManualReward />
          <ReportExport />
          <BigQueryDashboard />
        </div>
      </section>
    </div>
  );
}
