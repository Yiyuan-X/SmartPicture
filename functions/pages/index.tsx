import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useEffect, useState } from 'react';
import { UserTable } from './components/UserTable';
import { ReportCharts } from './components/ReportCharts';
import { InsightsMonitor } from './components/InsightsMonitor';
import { ManualReward } from './components/ManualReward';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/router';


export default function AdminDashboard() {
const router = useRouter();
const [role, setRole] = useState<string | null>(null);


useEffect(() => {
const auth = getAuth();
auth.onIdTokenChanged(async (user) => {
if (!user) return router.push('/login');
const token = await user.getIdTokenResult();
setRole(token.claims.role);
if (token.claims.role !== 'admin') router.push('/dashboard');
});
}, []);


if (role !== 'admin') return <div className="p-8 text-center">权限验证中...</div>;


return (
<div className="p-6 space-y-8">
<h1 className="text-3xl font-bold">管理控制台</h1>
<UserTable />
<ReportCharts />
<InsightsMonitor />
<ManualReward />
</div>
);
}