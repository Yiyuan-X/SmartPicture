import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import { collectionGroup, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import React, { useEffect, useState } from 'react';


export function InsightsMonitor() {
const [insights, setInsights] = useState<any[]>([]);


useEffect(() => {
(async () => {
const q = query(collectionGroup(db, 'daily'), orderBy('createdAt', 'desc'), limit(10));
const snapshot = await getDocs(q);
setInsights(snapshot.docs.map((d) => d.data()));
})();
}, []);


return (
<div className="bg-white rounded-2xl p-4 shadow">
<h2 className="text-xl font-semibold mb-2">洞察生成任务监控</h2>
<ul className="space-y-2">
{insights.map((i, idx) => (
<li key={idx} className="border-b pb-2">
<p className="text-sm text-gray-800">{i.summary.slice(0, 100)}...</p>
<p className="text-xs text-gray-500">{new Date(i.createdAt).toLocaleString()}</p>
</li>
))}
</ul>
</div>
);
}